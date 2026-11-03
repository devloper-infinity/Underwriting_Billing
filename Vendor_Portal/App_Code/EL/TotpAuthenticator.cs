using System;
using System.Security.Cryptography;
using System.Text;
using System.Web.Security;

namespace Vendor_Portal.App_Code.EL
{
    public static class TotpAuthenticator
    {
        private const string Base32Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

        public static string GenerateSecret()
        {
            byte[] bytes = new byte[20];
            using (RandomNumberGenerator rng = RandomNumberGenerator.Create())
                rng.GetBytes(bytes);
            return Base32Encode(bytes);
        }

        public static bool VerifyCode(string secret, string code, DateTime utcNow)
        {
            code = (code ?? string.Empty).Trim().Replace(" ", string.Empty);
            if (code.Length != 6)
                return false;

            long counter = (long)(utcNow - new DateTime(1970, 1, 1)).TotalSeconds / 30;
            for (long offset = -1; offset <= 1; offset++)
            {
                if (SlowEquals(GenerateCode(secret, counter + offset), code))
                    return true;
            }
            return false;
        }

        public static string BuildProvisioningUri(string issuer, string account, string secret)
        {
            string label = Uri.EscapeDataString(issuer + ":" + account);
            return "otpauth://totp/" + label + "?secret=" + secret + "&issuer=" +
                   Uri.EscapeDataString(issuer) + "&digits=6&period=30";
        }

        public static string ProtectSecret(string secret)
        {
            byte[] protectedBytes = MachineKey.Protect(Encoding.UTF8.GetBytes(secret), "VendorPortal.MFA.TOTP");
            return Convert.ToBase64String(protectedBytes);
        }

        public static string UnprotectSecret(string protectedSecret)
        {
            byte[] clearBytes = MachineKey.Unprotect(Convert.FromBase64String(protectedSecret), "VendorPortal.MFA.TOTP");
            if (clearBytes == null)
                throw new CryptographicException("The MFA secret could not be decrypted.");
            return Encoding.UTF8.GetString(clearBytes);
        }

        private static string GenerateCode(string secret, long counter)
        {
            byte[] key = Base32Decode(secret);
            byte[] counterBytes = BitConverter.GetBytes(counter);
            if (BitConverter.IsLittleEndian)
                Array.Reverse(counterBytes);

            byte[] hash;
            using (HMACSHA1 hmac = new HMACSHA1(key))
                hash = hmac.ComputeHash(counterBytes);

            int offset = hash[hash.Length - 1] & 0x0f;
            int binary = ((hash[offset] & 0x7f) << 24) |
                         ((hash[offset + 1] & 0xff) << 16) |
                         ((hash[offset + 2] & 0xff) << 8) |
                         (hash[offset + 3] & 0xff);
            return (binary % 1000000).ToString("D6");
        }

        private static string Base32Encode(byte[] data)
        {
            StringBuilder result = new StringBuilder();
            int buffer = data[0], next = 1, bitsLeft = 8;
            while (bitsLeft > 0 || next < data.Length)
            {
                if (bitsLeft < 5)
                {
                    if (next < data.Length) { buffer <<= 8; buffer |= data[next++] & 0xff; bitsLeft += 8; }
                    else { buffer <<= 5 - bitsLeft; bitsLeft = 5; }
                }
                result.Append(Base32Alphabet[(buffer >> (bitsLeft - 5)) & 0x1f]);
                bitsLeft -= 5;
            }
            return result.ToString();
        }

        private static byte[] Base32Decode(string value)
        {
            value = (value ?? string.Empty).TrimEnd('=').ToUpperInvariant();
            byte[] result = new byte[value.Length * 5 / 8];
            int buffer = 0, bitsLeft = 0, index = 0;
            foreach (char c in value)
            {
                int val = Base32Alphabet.IndexOf(c);
                if (val < 0) throw new FormatException("Invalid Base32 secret.");
                buffer = (buffer << 5) | val;
                bitsLeft += 5;
                if (bitsLeft >= 8) result[index++] = (byte)(buffer >> (bitsLeft -= 8));
            }
            return result;
        }

        private static bool SlowEquals(string left, string right)
        {
            int difference = left.Length ^ right.Length;
            for (int i = 0; i < left.Length && i < right.Length; i++)
                difference |= left[i] ^ right[i];
            return difference == 0;
        }
    }
}

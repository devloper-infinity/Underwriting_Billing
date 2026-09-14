<%@ Page Title="" Language="C#" MasterPageFile="~/BDM/BDM.Master" AutoEventWireup="true" CodeBehind="SecuritizationBilling_Revised.aspx.cs" Inherits="Vendor_Portal.BDM.SecuritizationBilling_Revised" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <style>
        .loading {
            display: none;
            position: fixed;
            top: 350px;
            left: 50%;
            margin-top: -96px;
            margin-left: -96px;
            /*  background-color: #ccc;*/
            opacity: .85;
            border-radius: 25px;
            width: 192px;
            height: 192px;
            z-index: 99999;
        }

        .dataTables_length, .dataTables_info {
            float: left !important;
        }

        label:not(.form-check-label):not(.custom-file-label) {
            font-weight: normal !important;
            border: none !important;
        }

        div.dt-buttons {
            position: static;
            padding-left: 50px;
            float: left;
        }

        .buttons-excel, .buttons-html5 {
            color: #fff;
            /*     background-color: #28a745;
            border-color: #28a745;*/
            box-shadow: none;
            background: linear-gradient(to right, #ffbf96, #fe7096);
            border: 0;
            font-weight: bold;
            margin: 0px 10px;
        }

        .table.dataTable th {
            background: linear-gradient(to bottom, #cbd0dd, 3%, #fff) !important;
            /*background-color:#e3e6ed!important;*/
            color: #000;
        }

        .table.dataTable tr td {
            background: none !important;
            background-color: #fff !important;
        }

        .form-control {
            line-height: 0.5 !important;
        }

        /*.form-control {
            font-size: 11px !important;
        }*/
    </style>
    <script>
        $(document).ready(function () {
            secbill_bindyear();
            BindSecuritization561Costing_Revised();
            BindSecuritization561BillingParameters();
        });
        function getTotalLoans() {
            var phcount = document.getElementById("secbill_ph_loancount").value;
            var cccount = document.getElementById("secbill_cc_loancount").value;
            var asfcount = document.getElementById("secbill_asf_loancount").value;
            var tpolcount = document.getElementById("secbill_tpol_loancount").value;
            var modcount = document.getElementById("secbill_mod_loancount").value;
            var ficocount = document.getElementById("secbill_fico_loancount").value;
            var datacount = document.getElementById("secbill_data_loancount").value;
            var mikecount = document.getElementById("secbill_mike_loancount").value;
            var relcount = document.getElementById("secbill_rel_loancount").value;
            if (phcount == "") phcount = 0;
            if (cccount == "") cccount = 0;
            if (asfcount == "") asfcount = 0;
            if (tpolcount == "") tpolcount = 0;
            if (modcount == "") modcount = 0;
            if (ficocount == "") ficocount = 0;
            if (datacount == "") datacount = 0;
            if (mikecount == "") mikecount = 0;
            if (relcount == "") relcount = 0;
            document.getElementById("secbill_total_loancount").value = parseInt(phcount) + parseInt(cccount) + parseInt(asfcount) + parseInt(tpolcount)
                + parseInt(modcount) + parseInt(ficocount) + parseInt(datacount) + parseInt(mikecount);

            if (phcount != "") {
                var phrate = document.getElementById("secbill_ph_rateperfile").innerHTML;
                if (phrate != "0") {
                    document.getElementById("secbill_ph_total").innerHTML = parseFloat(phcount) * parseFloat(phrate);
                }
            }
            if (cccount != "") {
                var ccrate = document.getElementById("secbill_cc_rateperfile").innerHTML;
                if (ccrate != "0") {
                    document.getElementById("secbill_cc_total").innerHTML = parseFloat(cccount) * parseFloat(ccrate);
                }
            }
            if (asfcount != "") {
                var asfrate = document.getElementById("secbill_asf_rateperfile").innerHTML;
                if (asfrate != "0") {
                    document.getElementById("secbill_asf_total").innerHTML = parseFloat(asfcount) * parseFloat(asfrate);
                }
            }
            if (tpolcount != "") {
                var tpolrate = document.getElementById("secbill_tpol_rateperfile").innerHTML;
                if (tpolrate != "0") {
                    document.getElementById("secbill_tpol_total").innerHTML = parseFloat(tpolcount) * parseFloat(tpolrate);
                }
            }
            if (modcount != "") {
                var modrate = document.getElementById("secbill_mod_rateperfile").innerHTML;
                if (modrate != "0") {
                    document.getElementById("secbill_mod_total").innerHTML = parseFloat(modcount) * parseFloat(modrate);
                }
            }
            if (ficocount != "") {
                var ficorate = document.getElementById("secbill_mod_rateperfile").innerHTML;
                if (ficorate != "0") {
                    document.getElementById("secbill_fico_total").innerHTML = parseFloat(ficocount) * parseFloat(ficorate);
                }
            }
            if (datacount != "") {
                var datarate = document.getElementById("secbill_data_rateperfile").innerHTML;
                if (datarate != "0") {
                    document.getElementById("secbill_data_total").innerHTML = parseFloat(datacount) * parseFloat(datarate);
                }
            }
            if (mikecount != "") {
                var mikerate = document.getElementById("secbill_mike_rateperfile").innerHTML;
                if (mikerate != "0") {
                    document.getElementById("secbill_mike_total").innerHTML = parseFloat(mikecount) * parseFloat(mikerate);
                }
            }
            if (relcount != "") {
                var relrate = document.getElementById("secbill_rel_rateperfile").innerHTML;
                if (relrate != "0") {
                    document.getElementById("secbill_rel_total").innerHTML = parseFloat(relcount) * parseFloat(relrate);
                }
            }
        }
        function getTotalHours() {
            var phhours = document.getElementById("secbill_ph_hours").value;
            var cchours = document.getElementById("secbill_cc_hours").value;
            var asfhours = document.getElementById("secbill_asf_hours").value;
            var tpolhours = document.getElementById("secbill_tpol_hours").value;
            var modhours = document.getElementById("secbill_mod_hours").value;
            var ficohours = document.getElementById("secbill_fico_hours").value;
            var datahours = document.getElementById("secbill_data_hours").value;
            var mikehours = document.getElementById("secbill_mike_hours").value;
            if (phhours == "") phhours = 0;
            if (cchours == "") cchours = 0;
            if (asfhours == "") asfhours = 0;
            if (tpolhours == "") tpolhours = 0;
            if (modhours == "") modhours = 0;
            if (ficohours == "") ficohours = 0;
            if (datahours == "") datahours = 0;
            if (mikehours == "") mikehours = 0;
            document.getElementById("secbill_total_hours").value = parseFloat(phhours) + parseFloat(cchours) + parseFloat(asfhours) + parseFloat(tpolhours)
                + parseFloat(modhours) + parseFloat(ficohours) + parseFloat(datahours) + parseFloat(mikehours);
        }
    </script>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <div class="loading" id="load1">
        <img src="../images/Load_1.gif" />
        <div style="font-size: 12px; font-weight: bold;">One moment, please . . . .</div>
    </div>
    <div class="content-header">
        <div class="container">
            <div class="row mb-2 callout callout-info">
                <div class="col-sm-6">
                    <h6 class="m-0"><i class="fas fa-copy"></i>&nbsp;&nbsp;<b>561 Securitization Billing</b></h6>
                </div>

            </div>
        </div>
        <!-- /.container-fluid -->
    </div>
    <div class="col-lg-12">
        <div class="card">
            <div class="card-body">
                <div class="card card-tabs">
                    <div class="card-header p-0 pt-1">
                        <ul class="nav nav-tabs" id="custom-tabs-one-tab_bpd_tabs" role="tablist">
                            <li class="nav-item">
                                <a class="nav-link active" id="custom-tabs-one-home-tab_company" data-toggle="pill" href="#custom-tabs-one-home_company" role="tab" aria-controls="custom-tabs-one-home_company" aria-selected="true"><b>Billing</b></a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" id="custom-tabs-one-profile-tab_sales" data-toggle="pill" href="#custom-tabs-one-profile_sales" role="tab" aria-controls="custom-tabs-one-profile_sales" aria-selected="false"><b>Costing</b></a>
                            </li>
                        </ul>
                    </div>
                    <div class="card-body">
                        <div class="tab-content" id="custom-tabs-one-tabContent_addinvocie">
                            <div class="tab-pane fade show active" id="custom-tabs-one-home_company" role="tabpanel" aria-labelledby="custom-tabs-one-home-tab_company">
                                <table class="table">
                                    <tr>
                                        <td style="width: 50px;"><b>Month:</b></td>
                                        <td style="width: 150px;">
                                            <select id="secbill_month" name="secbill_month" class="form-control">
                                                <option value="">Select</option>
                                                <option value="January">January</option>
                                                <option value="February">February</option>
                                                <option value="March">March</option>
                                                <option value="April">April</option>
                                                <option value="May">May</option>
                                                <option value="June">June</option>
                                                <option value="July">July</option>
                                                <option value="August">August</option>
                                                <option value="September">September</option>
                                                <option value="October">October</option>
                                                <option value="November">November</option>
                                                <option value="December">December</option>
                                            </select>
                                        </td>
                                        <td style="width: 50px;">
                                            <b>Year:</b>
                                        </td>
                                        <td style="width: 150px;">
                                            <select id="secbill_year" name="secbill_year" class="form-control">
                                                <option value="">Select</option>
                                            </select>
                                        </td>
                                    </tr>
                                </table>
                                <table class="table table-bordered" id="secbill_table">
                                    <thead>
                                        <tr>
                                            <th>
                                                <input type="text" id="secbill_description1" name="secbill_description1" class="form-control" style="width: 350px; font-weight: bold;" placeholder="Description" />
                                            </th>
                                            <th style="text-align: center;">Loans</th>
                                            <th style="text-align: center;">Hours</th>
                                            <th style="text-align: center;">Per File Rate</th>
                                            <th style="text-align: center;">Hourly Rate</th>
                                            <th style="text-align: center;">Total Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    </tbody>
                                </table>
                                <table class="table table-bordered" style="display:none;">
                                    <thead>
                                        <tr>
                                            <th>
                                                <input type="text" id="secbill_description" name="secbill_description" class="form-control" style="width: 350px; font-weight: bold;" placeholder="Description" />
                                            </th>
                                            <th style="text-align: center;">Loans</th>
                                            <th style="text-align: center;">Hours</th>
                                            <th style="text-align: center;">Per File Rate</th>
                                            <th style="text-align: center;">Hourly Rate</th>
                                            <th style="text-align: center;">Total Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><b>PH</b></td>
                                            <td style="text-align: center;">
                                                <input type="number" id="secbill_ph_loancount" onchange="onphratechange();" name="secbill_ph_loancount" class="form-control" style="width: 100px; display: inline;" />
                                            </td>
                                            <td style="text-align: center;">
                                                <input type="number" id="secbill_ph_hours" onchange="onphratechange();" name="secbill_ph_hours" class="form-control" style="width: 100px; display: inline;" />
                                            </td>
                                            <td style="text-align: center;">
                                                <label id="secbill_ph_rateperfile" class="bootstrap-switch-lightblue"></label>
                                            </td>
                                            <td style="text-align: center;">
                                                <label id="secbill_ph_hourlyrate" class="bootstrap-switch-lightblue"></label>
                                            </td>
                                            <td style="text-align: center;">
                                                <label id="secbill_ph_total" class="bootstrap-switch-lightblue"></label>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td><b>CCs</b></td>
                                            <td style="text-align: center;">
                                                <input type="number" id="secbill_cc_loancount" onchange="onccratechange();" name="secbill_cc_loancount" class="form-control" style="width: 100px; display: inline;" />
                                            </td>
                                            <td style="text-align: center;">
                                                <input type="number" id="secbill_cc_hours" onchange="onccratechange();" name="secbill_cc_hours" class="form-control" style="width: 100px; display: inline;" />
                                            </td>
                                            <td style="text-align: center;">
                                                <label id="secbill_cc_rateperfile" class="bootstrap-switch-lightblue"></label>
                                            </td>
                                            <td style="text-align: center;">
                                                <label id="secbill_cc_hourlyrate" class="bootstrap-switch-lightblue"></label>
                                            </td>
                                            <td style="text-align: center;">
                                                <label id="secbill_cc_total" class="bootstrap-switch-lightblue"></label>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td><b>ASF Data Update</b></td>
                                            <td style="text-align: center;">
                                                <input type="number" id="secbill_asf_loancount" onchange="onasfratechange();" name="secbill_asf_loancount" class="form-control" style="width: 100px; display: inline;" />
                                            </td>
                                            <td style="text-align: center;">
                                                <input type="number" id="secbill_asf_hours" onchange="onasfratechange();" name="secbill_asf_hours" class="form-control" style="width: 100px; display: inline;" />
                                            </td>
                                            <td style="text-align: center;">
                                                <label id="secbill_asf_rateperfile" class="bootstrap-switch-lightblue"></label>
                                            </td>
                                            <td style="text-align: center;">
                                                <label id="secbill_asf_hourlyrate" class="bootstrap-switch-lightblue"></label>
                                            </td>
                                            <td style="text-align: center;">
                                                <label id="secbill_asf_total" class="bootstrap-switch-lightblue"></label>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td><b>TPOL Pull</b></td>
                                            <td style="text-align: center;">
                                                <input type="number" id="secbill_tpol_loancount" onchange="ontpolratechange();" name="secbill_tpol_loancount" class="form-control" style="width: 100px; display: inline;" />
                                            </td>
                                            <td style="text-align: center;">
                                                <input type="number" id="secbill_tpol_hours" onchange="ontpolratechange();" name="secbill_tpol_hours" class="form-control" style="width: 100px; display: inline;" />
                                            </td>
                                            <td style="text-align: center;">
                                                <label id="secbill_tpol_rateperfile" class="bootstrap-switch-lightblue"></label>
                                            </td>
                                            <td style="text-align: center;">
                                                <label id="secbill_tpol_hourlyrate" class="bootstrap-switch-lightblue"></label>
                                            </td>
                                            <td style="text-align: center;">
                                                <label id="secbill_tpol_total" class="bootstrap-switch-lightblue"></label>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td><b>MOD Review</b></td>
                                            <td style="text-align: center;">
                                                <input type="number" id="secbill_mod_loancount" onchange="onmodratechange();" name="secbill_mod_loancount" class="form-control" style="width: 100px; display: inline;" />
                                            </td>
                                            <td style="text-align: center;">
                                                <input type="number" id="secbill_mod_hours" onchange="onmodratechange();" name="secbill_mod_hours" class="form-control" style="width: 100px; display: inline;" />
                                            </td>
                                            <td style="text-align: center;">
                                                <label id="secbill_mod_rateperfile" class="bootstrap-switch-lightblue"></label>
                                            </td>
                                            <td style="text-align: center;">
                                                <label id="secbill_mod_hourlyrate" class="bootstrap-switch-lightblue"></label>
                                            </td>
                                            <td style="text-align: center;">
                                                <label id="secbill_mod_total" class="bootstrap-switch-lightblue"></label>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td><b>FICO Pull</b></td>
                                            <td style="text-align: center;">
                                                <input type="number" id="secbill_fico_loancount" onchange="onficoratechange();" name="secbill_fico_loancount" class="form-control" style="width: 100px; display: inline;" />
                                            </td>
                                            <td style="text-align: center;">
                                                <input type="number" id="secbill_fico_hours" onchange="onficoratechange();" name="secbill_fico_hours" class="form-control" style="width: 100px; display: inline;" />
                                            </td>
                                            <td style="text-align: center;">
                                                <label id="secbill_fico_rateperfile" class="bootstrap-switch-lightblue"></label>
                                            </td>
                                            <td style="text-align: center;">
                                                <label id="secbill_fico_hourlyrate" class="bootstrap-switch-lightblue"></label>
                                            </td>
                                            <td style="text-align: center;">
                                                <label id="secbill_fico_total" class="bootstrap-switch-lightblue"></label>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td><b>Data Team</b></td>
                                            <td style="text-align: center;">
                                                <input type="number" id="secbill_data_loancount" onchange="ondataratechange();" name="secbill_data_loancount" class="form-control" style="width: 100px; display: inline;" />
                                            </td>
                                            <td style="text-align: center;">
                                                <input type="number" id="secbill_data_hours" onchange="ondataratechange();" name="secbill_data_hours" class="form-control" style="width: 100px; display: inline;" />
                                            </td>
                                            <td style="text-align: center;">
                                                <label id="secbill_data_rateperfile" class="bootstrap-switch-lightblue"></label>
                                            </td>
                                            <td style="text-align: center;">
                                                <label id="secbill_data_hourlyrate" class="bootstrap-switch-lightblue"></label>
                                            </td>
                                            <td style="text-align: center;">
                                                <label id="secbill_data_total" class="bootstrap-switch-lightblue"></label>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td><b>Mike/Leads (reporting)</b></td>
                                            <td style="text-align: center;">
                                                <input type="number" id="secbill_mike_loancount" onchange="onmikeratechange();" name="secbill_mike_loancount" class="form-control" style="width: 100px; display: inline;" />
                                            </td>
                                            <td style="text-align: center;">
                                                <input type="number" id="secbill_mike_hours" onchange="onmikeratechange();" name="secbill_mike_hours" class="form-control" style="width: 100px; display: inline;" />
                                            </td>
                                            <td style="text-align: center;">
                                                <label id="secbill_mike_rateperfile" class="bootstrap-switch-lightblue"></label>
                                            </td>
                                            <td style="text-align: center;">
                                                <label id="secbill_mike_hourlyrate" class="bootstrap-switch-lightblue"></label>
                                            </td>
                                            <td style="text-align: center;">
                                                <label id="secbill_mike_total" class="bootstrap-switch-lightblue"></label>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td><b style="font-size: 14px;">TOTAL</b></td>
                                            <td style="text-align: center;">
                                                <label id="secbill_total_loancount" class="bootstrap-switch-lightblue" style="width: 100px; display: inline; font-size: 14px; font-weight: bold;"></label>
                                            </td>
                                            <td style="text-align: center;">
                                                <label id="secbill_total_hours" class="bootstrap-switch-lightblue" style="width: 100px; display: inline; font-size: 14px; font-weight: bold;"></label>
                                            </td>
                                            <td></td>
                                            <td></td>
                                            <td style="text-align: center;">
                                                <label id="secbill_total_amount" class="bootstrap-switch-lightblue" style="width: 100px; display: inline; font-size: 14px; font-weight: bold; color: green;"></label>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                        </tr>
                                        <tr>
                                            <td><b>Reliance Letter</b></td>
                                            <td style="text-align: center;">
                                                <input type="number" id="secbill_rel_loancount" onchange="onrelratechange();" name="secbill_rel_loancount" class="form-control" style="width: 100px; display: inline;" />
                                            </td>
                                            <td style="text-align: center;">
                                                <input type="number" id="secbill_rel_hours" onchange="onrelratechange();" name="secbill_rel_hours" class="form-control" style="width: 100px; display: inline;" />
                                            </td>
                                            <td style="text-align: center;">
                                                <label id="secbill_rel_rateperfile" class="bootstrap-switch-lightblue"></label>
                                            </td>
                                            <td style="text-align: center;">
                                                <label id="secbill_rel_hourlyrate" class="bootstrap-switch-lightblue"></label>
                                            </td>
                                            <td style="text-align: center;">
                                                <label id="secbill_rel_total" class="bootstrap-switch-lightblue"></label>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td><b style="font-size: 14px;">TOTAL (Including Reliance Letter)</b></td>
                                            <td style="text-align: center;">
                                                <label id="secbill_totalAll_loancount" class="bootstrap-switch-lightblue" style="width: 100px; display: inline; font-size: 14px; font-weight: bold;"></label>
                                            </td>
                                            <td style="text-align: center;">
                                                <label id="secbill_totalAll_hours" class="bootstrap-switch-lightblue" style="width: 100px; display: inline; font-size: 14px; font-weight: bold;"></label>
                                            </td>
                                            <td></td>
                                            <td></td>
                                            <td style="text-align: center;">
                                                <label id="secbill_totalAll_amount" class="bootstrap-switch-lightblue" style="width: 100px; display: inline; font-size: 14px; font-weight: bold; color: green;"></label>

                                            </td>
                                        </tr>
                                        <tr>
                                            <td colspan="6" style="text-align: center;">
                                                <button id="secbill_btnsubmitbilling" name="secbill_btnsubmitbilling" class="btn btn-primary" onclick="return secbill_submitbilling();">Verify and Submit</button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div class="tab-pane fade" id="custom-tabs-one-profile_sales" role="tabpanel" aria-labelledby="custom-tabs-one-profile-tab_sales">
                                <table class="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Description</th>
                                            <th style="text-align: center;">Per File Rate</th>
                                            <th style="text-align: center;">Hourly Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><b>PH</b></td>
                                            <td style="text-align: center;">
                                                <input type="number" id="secbill_ph_loancount_rate" onchange="getTotalLoans();" name="secbill_ph_loancount_rate" class="form-control" style="width: 100px; display: inline;" />
                                            </td>
                                            <td style="text-align: center;">
                                                <input type="number" id="secbill_ph_hours_rate" onchange="getTotalHours();" name="secbill_ph_hours_rate" class="form-control" style="width: 100px; display: inline;" />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td><b>CCs</b></td>
                                            <td style="text-align: center;">
                                                <input type="number" id="secbill_cc_loancount_rate" onchange="getTotalLoans();" name="secbill_cc_loancount_rate" class="form-control" style="width: 100px; display: inline;" />
                                            </td>
                                            <td style="text-align: center;">
                                                <input type="number" id="secbill_cc_hours_rate" onchange="getTotalHours();" name="secbill_cc_hours_rate" class="form-control" style="width: 100px; display: inline;" />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td><b>ASF Data Update</b></td>
                                            <td style="text-align: center;">
                                                <input type="number" id="secbill_asf_loancount_rate" onchange="getTotalLoans();" name="secbill_asf_loancount_rate" class="form-control" style="width: 100px; display: inline;" />
                                            </td>
                                            <td style="text-align: center;">
                                                <input type="number" id="secbill_asf_hours_rate" onchange="getTotalHours();" name="secbill_asf_hours_rate" class="form-control" style="width: 100px; display: inline;" />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td><b>TPOL Pull</b></td>
                                            <td style="text-align: center;">
                                                <input type="number" id="secbill_tpol_loancount_rate" onchange="getTotalLoans();" name="secbill_tpol_loancount_rate" class="form-control" style="width: 100px; display: inline;" />
                                            </td>
                                            <td style="text-align: center;">
                                                <input type="number" id="secbill_tpol_hours_rate" onchange="getTotalHours();" name="secbill_tpol_hours_rate" class="form-control" style="width: 100px; display: inline;" />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td><b>MOD Review</b></td>
                                            <td style="text-align: center;">
                                                <input type="number" id="secbill_mod_loancount_rate" onchange="getTotalLoans();" name="secbill_mod_loancount_rate" class="form-control" style="width: 100px; display: inline;" />
                                            </td>
                                            <td style="text-align: center;">
                                                <input type="number" id="secbill_mod_hours_rate" onchange="getTotalHours();" name="secbill_mod_hours_rate" class="form-control" style="width: 100px; display: inline;" />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td><b>FICO Pull</b></td>
                                            <td style="text-align: center;">
                                                <input type="number" id="secbill_fico_loancount_rate" onchange="getTotalLoans();" name="secbill_fico_loancount_rate" class="form-control" style="width: 100px; display: inline;" />
                                            </td>
                                            <td style="text-align: center;">
                                                <input type="number" id="secbill_fico_hours_rate" onchange="getTotalHours();" name="secbill_fico_hours_rate" class="form-control" style="width: 100px; display: inline;" />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td><b>Data Team</b></td>
                                            <td style="text-align: center;">
                                                <input type="number" id="secbill_data_loancount_rate" onchange="getTotalLoans();" name="secbill_data_loancount_rate" class="form-control" style="width: 100px; display: inline;" />
                                            </td>
                                            <td style="text-align: center;">
                                                <input type="number" id="secbill_data_hours_rate" onchange="getTotalHours();" name="secbill_data_hours_rate" class="form-control" style="width: 100px; display: inline;" />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td><b>Mike/Leads (reporting)</b></td>
                                            <td style="text-align: center;">
                                                <input type="number" id="secbill_mike_loancount_rate" onchange="getTotalLoans();" name="secbill_mike_loancount_rate" class="form-control" style="width: 100px; display: inline;" />
                                            </td>
                                            <td style="text-align: center;">
                                                <input type="number" id="secbill_mike_hours_rate" onchange="getTotalHours();" name="secbill_mike_hours_rate" class="form-control" style="width: 100px; display: inline;" />
                                            </td>
                                        </tr>

                                        <tr>
                                            <td><b>Reliance Letter</b></td>
                                            <td style="text-align: center;">
                                                <input type="number" id="secbill_rel_loancount_rate" name="secbill_rel_loancount_rate" class="form-control" style="width: 100px; display: inline;" />
                                            </td>
                                            <td style="text-align: center;">
                                                <input type="number" id="secbill_rel_hours_rate" name="secbill_rel_hours_rate" class="form-control" style="width: 100px; display: inline;" />
                                            </td>
                                        </tr>

                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colspan="3" style="text-align: center;">
                                                <button id="secrel_cost_btnsubmit" name="secrel_cost_btnsubmit" onclick="return secrel_cost_submit();" class="btn btn-primary">Submit</button>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="modal fade" id="secbill_dverror">
        <div class="modal-dialog modal-sm">
            <div class="modal-content">
                <div class="modal-header">
                    <h6 class="modal-title" id="secbill_errmsg"></h6>
                </div>
                <div class="modal-footer align-content-center">
                    <button class="btn btn-primary" type="button" id="secbill_btnMessage" onclick="location.reload();">Okay</button>
                </div>
            </div>
            <!-- /.modal-content -->
        </div>
        <!-- /.modal-dialog -->
    </div>

</asp:Content>

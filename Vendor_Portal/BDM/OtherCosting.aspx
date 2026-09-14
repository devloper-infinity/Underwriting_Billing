<%@ Page Title="" Language="C#" MasterPageFile="~/BDM/BDM.Master" AutoEventWireup="true" CodeBehind="OtherCosting.aspx.cs" Inherits="Vendor_Portal.BDM.OtherCosting" %>

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

        /*.form-control {
            font-size: 11px !important;
        }*/
    </style>
    <script>
        $(document).ready(function () {
            sacrel_BindProjects();
            secrel_BindOtherCosting();
        });
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
                    <h6 class="m-0"><i class="fas fa-copy"></i>&nbsp;&nbsp;<b>Securitization/ Reliance Letter Costing</b></h6>
                </div>
            </div>
        </div>
        <!-- /.container-fluid -->
    </div>
    <div class="col-lg-12">
        <div class="card">
            <div class="card-body">
                <table class="table">
                    <tr>
                        <td><b>Project:</b></td>
                        <td>
                            <select id="secrel_project" name="secrel_project" class="form-control" style="width: 250px;"></select>
                        </td>
                        <td><b>Rate:</b></td>
                        <td>
                            <input id="secrel_rate" name="secrel_rate" class="form-control" style="width: 250px;" />
                        </td>
                        <td><b>Type:</b></td>
                        <td>
                            <select id="secrel_type" name="secrel_type" class="form-control" style="width: 250px;">
                                <option value="">Select</option>
                                <option value="Securitization">Securitization</option>
                                <option value="Reliance Letter">Reliance Letter</option>
                                <option value="Condition Clearing">Condition Clearing</option>
                                <option value="Research">Research</option>
                                <option value="PH">PH</option>
                                <option value="CCs">CCs</option>
                                <option value="ASF Data Update">ASF Data Update</option>
                                <option value="TPOL Pull">TPOL Pull</option>
                                <option value="Data Team">Data Team</option>
                                <option value="Mike/Leads (reporting)">Mike/Leads (reporting)</option>
                                <option value="MOD Review">MOD Review</option>
                                <option value="FICO Pull">FICO Pull</option>
                            </select>
                        </td>

                    </tr>
                    <tr>
                        <td colspan="6" style="text-align: center;">
                            <button id="secrel_btnsubmit" name="secrel_btnsubmit" class="btn btn-primary" onclick="return secrel_submit();">Submit</button>
                        </td>
                    </tr>
                </table>
                <hr />
                <table class="table table-bordered" id="secrel_table" style="width: 100%">
                    <thead>
                        <tr>
                            <th class="sort border-top ps-3" style="text-wrap: nowrap;">Project #</th>
                            <th class="sort border-top ps-3" style="text-wrap: nowrap;">Rate</th>
                            <th class="sort border-top ps-3" style="text-wrap: nowrap;">Type</th>
                            <th class="sort border-top ps-3" style="text-wrap: nowrap;">Added By</th>
                            <th class="sort border-top ps-3" style="text-wrap: nowrap;">Added Date</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
    </div>

    <div class="modal fade" id="secrel_dverror">
        <div class="modal-dialog modal-sm">
            <div class="modal-content">
                <div class="modal-header">
                    <h6 class="modal-title" id="secrel_errmsg"></h6>
                </div>
                <div class="modal-footer align-content-center">
                    <button class="btn btn-primary" type="button" id="secrel_btnMessage" onclick="return secrel_MessageRedirect();">Okay</button>
                </div>
            </div>
            <!-- /.modal-content -->
        </div>
        <!-- /.modal-dialog -->
    </div>
</asp:Content>

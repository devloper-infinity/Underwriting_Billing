<%@ Page Title="" Language="C#" MasterPageFile="~/BDM/BDM.Master" AutoEventWireup="true" CodeBehind="Dashboard.aspx.cs" Inherits="Vendor_Portal.BDM.Dashboard" %>

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
            background: linear-gradient(to bottom, #cbd0dd, 3%, #fff);
            /*background-color:#e3e6ed!important;*/
            color: #000;
        }

        .table.dataTable tr td {
            background: none !important;
            background-color: #fff !important;
        }

        .dtfc-fixed-left {
            left: 0px !important;
        }


        /*.form-control {
            font-size: 11px !important;
        }*/
    </style>
    <script>
        $(document).ready(function () {
            dashboard_arBind_displayERP();
        });
    </script>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <div class="loading" id="load1">
        <img src="../images/Load_1.gif" />
        <div style="font-size: 12px; font-weight: bold;">One moment, please . . . .</div>
    </div>
    <div class="col-lg-12">
        <div class="card">
            <div class="card-body">
                <div class="card card-tabs">
                    <div class="card-header p-0 pt-1">
                        <ul class="nav nav-tabs" id="custom-tabs-one-tab_bpd_tabs" role="tablist">
                            <li class="nav-item">
                                <a class="nav-link active" id="custom-tabs-one-home-tab_company" data-toggle="pill" href="#custom-tabs-one-home_company" role="tab" aria-controls="custom-tabs-one-home_company" aria-selected="true"><b>Summary</b></a>
                            </li>
                            <li class="nav-item" style="display:none;">
                                <a class="nav-link" onclick="return dashboard_arBind_DifferenceQuickbook_BillNo();" id="custom-tabs-one-profile-tab_sales" data-toggle="pill" href="#custom-tabs-one-profile_sales" role="tab" aria-controls="custom-tabs-one-profile_sales" aria-selected="false"><b>Comparison with Quickbook</b></a>
                            </li>
                            <li class="nav-item" style="display:none;">
                                <a class="nav-link" onclick="return dashboard_arBind();" id="custom-tabs-one-profile-tab_deal" data-toggle="pill" href="#custom-tabs-one-profile_deal" role="tab" aria-controls="custom-tabs-one-profile_deal" aria-selected="false"><b>Update Quickbook Data</b></a>
                            </li>
                        </ul>
                    </div>
                    <div class="card-body">
                        <div class="tab-content" id="custom-tabs-one-tabContent_addinvocie">
                            <div class="tab-pane fade show active" id="custom-tabs-one-home_company" role="tabpanel" aria-labelledby="custom-tabs-one-home-tab_company">
                                <table class="table table-bordered" id="dashboard_ar" style="width: 100%;">
                                </table>
                            </div>
                            <div class="tab-pane fade" id="custom-tabs-one-profile_sales" role="tabpanel" aria-labelledby="custom-tabs-one-profile-tab_sales">
                                <label id="newlabl"></label>
                                <button id="dashboard_btnrefreshgrid" name="dashboard_btnrefreshgrid" class="btn btn-primary" style="float: left; position: relative; z-index: 1000;" onclick="return dashboard_arBind_DifferenceQuickbook_BillNo();">Refresh Data</button>
                                <table class="table table-bordered" id="dashboard_ardifference" style="width: 100%;">
                                </table>
                            </div>
                            <div class="tab-pane fade" id="custom-tabs-one-profile_deal" role="tabpanel" aria-labelledby="custom-tabs-one-profile_deal">
                                <table class="table table-bordered" id="dashboard_ar_update" style="width: 100%;">
                                </table>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="modal fade" id="waitingpanel" tabindex="-1" data-bs-backdrop="static" aria-hidden="true">
        <div class="modal-dialog text-center">
            <img src="../Images/Load.gif" />
            <br />
            <span style="color: #fff; font-size: 24px; font-weight: bold; font-style: italic;" id="spntext">System is updating details. Please wait</span>
            <span style="color: #fff; font-size: 48px; font-weight: bold; font-style: italic; animation: animate 1s linear infinite;">&nbsp;. . . .</span>
        </div>
    </div>
    <%--Add Reconciliation Remark--%>
    <div class="modal fade" id="dashboard_updateremark">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h4 class="modal-title">Add Reconciliation Remark</h4>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <table class="table">
                        <tr>
                            <td><b>Client:</b></td>
                            <td>
                                <label id="dashboard_projectid" class="form-control" style="width: 300px; display: none;"></label>
                                <label id="dashboard_monthyear" class="form-control" style="width: 300px; display: none;"></label>
                                <label id="dashboard_projectno" class="form-control" style="width: 300px;"></label>
                            </td>
                            <td><b>Process:</b></td>
                            <td>
                                <label id="dashboard_process" class="form-control" style="width: 300px;"></label>
                            </td>
                        </tr>
                        <tr>

                            <td><b>Remark:</b></td>
                            <td colspan="3">
                                <textarea id="dashboard_remark" name="dashboard_remark" class="form-control" style="width: 300px;"></textarea>
                            </td>

                        </tr>
                    </table>
                </div>
                <div class="modal-footer justify-content-between">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    <button class="btn btn-primary" type="button" id="dashboard_remark_btnsubmit" onclick="return dashboard_remark_submit();">Submit</button>
                </div>
            </div>
            <!-- /.modal-content -->
        </div>
        <!-- /.modal-dialog -->
    </div>
    <%--Upload Excel Attachment--%>
    <div class="modal fade" id="dashboard_uploadattachment">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h4 class="modal-title">Upload Excel Attachment</h4>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <table class="table">
                        <tr>
                            <td><b>Client:</b></td>
                            <td>
                                <label id="dashboard_projectid_upload" class="form-control" style="width: 300px; display: none;"></label>
                                <label id="dashboard_monthyear_upload" class="form-control" style="width: 300px; display: none;"></label>
                                <label id="dashboard_projectno_upload" class="form-control" style="width: 300px;"></label>
                            </td>
                            <td><b>Process:</b></td>
                            <td>
                                <label id="dashboard_process_upload" class="form-control" style="width: 300px;"></label>
                            </td>
                        </tr>
                        <tr>

                            <td><b>Attachment:</b></td>
                            <td>
                                <input type="file" id="dashboard_attachment_upload" class="form-control" style="width: 300px;" />
                            </td>
                            <td></td>
                            <td></td>

                        </tr>
                    </table>
                </div>
                <div class="modal-footer justify-content-between">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    <button class="btn btn-primary" type="button" id="dashboard_upload_btnsubmit" onclick="return dashboard_upload_submit();">Submit</button>
                </div>
            </div>
            <!-- /.modal-content -->
        </div>
        <!-- /.modal-dialog -->
    </div>

    <div class="modal fade" id="dashboard_RecRemark_dverror">
        <div class="modal-dialog modal-sm">
            <div class="modal-content">
                <div class="modal-header">
                    <h6 class="modal-title" id="dashboard_RecRemark_errmsg"></h6>
                </div>
                <div class="modal-footer align-content-center">
                    <button class="btn btn-primary" type="button" id="dashboard_RecRemark_btnMessage" onclick="return dashboard_RecRemark_MessageRedirect();">Okay</button>
                </div>
            </div>
            <!-- /.modal-content -->
        </div>
        <!-- /.modal-dialog -->
    </div>
</asp:Content>

<%@ Page Title="" Language="C#" MasterPageFile="~/BDM/BDM.Master" AutoEventWireup="true" CodeBehind="CostPerRecordReport.aspx.cs" Inherits="Vendor_Portal.BDM.CostPerRecordReport" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <script src="../Scripts/Functions/CostingMaster.js?v=1"></script>
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

        .costing-form label { font-weight: 600 !important; }
        .cm-project-picker { position: relative; }
        .cm-project-menu {
            display: none; position: absolute; z-index: 1050; width: 100%; max-height: 280px;
            overflow: hidden; background: #fff; border: 1px solid #ced4da; border-radius: .25rem;
            box-shadow: 0 .5rem 1rem rgba(0,0,0,.15); padding: .5rem;
        }
        .cm-project-list { max-height: 210px; overflow-y: auto; margin-top: .5rem; }
        .cm-project-option { display: block; padding: .2rem .35rem; margin: 0; cursor: pointer; }
        .cm-project-option:hover { background: #f2f4f7; }
    </style>
    <script>
        $(document).ready(function () {
            cppr_bindyear();
        });

        function cppr_exporttoexcel() {
            $('#waitingpanel').modal('show');
            document.getElementById("spntext").innerHTML = "Generating Userwise sheet";
            var ddlmonth = document.getElementById("cppr_month");
            var month = ddlmonth.options[ddlmonth.selectedIndex].value;
            var ddlyear = document.getElementById("cppr_year");
            var year = ddlyear.options[ddlyear.selectedIndex].value;
            PageMethods.UserwiseReport(month, year, cppr_userwise_OnSuccess, cppr_userwise_OnError);

            return false;
        }

        function cppr_userwise_OnSuccess(result) {
            var ddlmonth = document.getElementById("cppr_month");
            var month = ddlmonth.options[ddlmonth.selectedIndex].value;
            var ddlyear = document.getElementById("cppr_year");
            var year = ddlyear.options[ddlyear.selectedIndex].value;
            document.getElementById("spntext").innerHTML = "Generating domainwise sheet";
            PageMethods.DomainwiseReport(month, year, cppr_domainwise_OnSucess, cppr_domainwise_OnError);
            return false;
        }

        function cppr_domainwise_OnSucess(result) {
            var ddlmonth = document.getElementById("cppr_month");
            var month = ddlmonth.options[ddlmonth.selectedIndex].value;
            var ddlyear = document.getElementById("cppr_year");
            var year = ddlyear.options[ddlyear.selectedIndex].value;
            document.getElementById("spntext").innerHTML = "Generating projectwise sheet";
            PageMethods.ProjectwiseReport(month, year, cppr_projectwise_OnSucess, cppr_projectwise_OnError);
            return false;
        }

        function cppr_projectwise_OnSucess(result) {
            document.getElementById("spntext").innerHTML = "Report Prepeation Completed. Downloading Report";
            $('#waitingpanel').modal('hide');
            __doPostBack("<%= btn1.UniqueID %>", '');
            return false;
        }


        function cppr_userwise_OnError(error) {
            alert(error.responseText);
        }

        function cppr_domainwise_OnError(error) {
            alert(error.responseText);
        }
        function cppr_projectwise_OnError(error) {
            alert(error.responseText);
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
                    <h6 class="m-0"><i class="fas fa-copy"></i>&nbsp;&nbsp;<b>Cost Per Record Report</b></h6>
                </div>
            </div>
        </div>
        <!-- /.container-fluid -->
    </div>
    <div class="col-lg-12">
        <div class="card">
            <div class="card-body">
                <h5 class="card-title"></h5>
                <table class="table">
                    <tr>
                        <td style="width: 50px;"><b>Month:</b></td>
                        <td style="width: 150px;">
                            <select id="cppr_month" name="cppr_month" class="form-control">
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
                            <select id="cppr_year" name="cppr_year" class="form-control">
                                <option value="">Select</option>
                            </select>
                        </td>
                        <td>
                            <button id="cppr_btnShow" class="btn btn-primary" onclick="return cprr_bindUserGrid();">Show</button>
                            &nbsp;
                            <button id="cppr_btnexport" class="btn btn-primary" onclick="return cppr_exporttoexcel()">Export to excel</button>
                            <%--onclick="return BindMagnaGrid();"--%>
                            <asp:Button ID="btn1" runat="server" Style="display: none;" OnClick="btn1_Click" />
                        </td>
                    </tr>
                </table>
                <hr />

                <div class="card">
                    <div class="card-body">
                        <div class="card card-tabs">
                            <div class="card-header p-0 pt-1">
                                <ul class="nav nav-tabs" id="custom-tabs-one-tab_bpd_tabs" role="tablist">
                                    <li class="nav-item">
                                        <a class="nav-link active" id="custom-tabs-one-home-tab_company" data-toggle="pill" href="#custom-tabs-one-home_company" role="tab" aria-controls="custom-tabs-one-home_company" aria-selected="true"><b>Userwise</b></a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" onclick="return cprr_bindDomainGrid();" id="custom-tabs-one-profile-tab_sales" data-toggle="pill" href="#custom-tabs-one-profile_sales" role="tab" aria-controls="custom-tabs-one-profile_sales" aria-selected="false"><b>Domainwise</b></a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" onclick="return cprr_bindProjectGrid();" id="custom-tabs-one-profile-tab_deal" data-toggle="pill" href="#custom-tabs-one-profile_deal" role="tab" aria-controls="custom-tabs-one-profile_deal" aria-selected="false"><b>Projectwise</b></a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" onclick="return cm_openCostingMaster();" id="costing-master-tab" data-toggle="pill" href="#costing-master" role="tab" aria-controls="costing-master" aria-selected="false"><b>Costing Master</b></a>
                                    </li>

                                </ul>
                            </div>
                            <div class="card-body">
                                <div class="tab-content" id="custom-tabs-one-tabContent_addinvocie">
                                    <div class="tab-pane fade show active" id="custom-tabs-one-home_company" role="tabpanel" aria-labelledby="custom-tabs-one-home-tab_company">
                                        <table class="table" id="cprr_userwise" style="width: 100%;">
                                        </table>
                                    </div>
                                    <div class="tab-pane fade" id="custom-tabs-one-profile_sales" role="tabpanel" aria-labelledby="custom-tabs-one-profile-tab_sales">
                                        <table class="table" id="cprr_domainwise" style="width: 100%;">
                                        </table>
                                    </div>
                                    <div class="tab-pane fade" id="custom-tabs-one-profile_deal" role="tabpanel" aria-labelledby="custom-tabs-one-profile_deal">
                                        <table class="table" id="cprr_projectwise" style="width: 100%;">
                                        </table>
                                    </div>
                                    <div class="tab-pane fade" id="costing-master" role="tabpanel" aria-labelledby="costing-master-tab">
                                        <ul class="nav nav-tabs" id="costing-master-inner-tabs" role="tablist">
                                            <li class="nav-item"><a class="nav-link active" id="costing-header-tab" data-toggle="pill" href="#costing-header-pane" role="tab"><b>Costing Header</b></a></li>
                                            <li class="nav-item"><a class="nav-link" id="add-costing-tab" data-toggle="pill" href="#add-costing-pane" role="tab"><b>Add Costing</b></a></li>
                                        </ul>
                                        <div class="tab-content pt-3">
                                            <div class="tab-pane fade show active" id="costing-header-pane" role="tabpanel">
                                                <div class="row costing-form">
                                                    <div class="col-md-6 form-group">
                                                        <label for="cm_headerName">Costing Header</label>
                                                        <input type="text" id="cm_headerName" class="form-control" maxlength="200" placeholder="Enter Costing Header" />
                                                    </div>
                                                    <div class="col-md-2 form-group d-flex align-items-end">
                                                        <button type="button" class="btn btn-primary" onclick="return cm_saveHeader();">Save</button>
                                                    </div>
                                                </div>
                                                <hr />
                                                <table class="table table-bordered" id="cm_headerTable" style="width: 100%;"></table>
                                            </div>
                                            <div class="tab-pane fade" id="add-costing-pane" role="tabpanel">
                                                <div class="row costing-form">
                                                    <div class="col-md-2 form-group">
                                                        <label for="cm_month">Month</label>
                                                        <select id="cm_month" class="form-control">
                                                            <option value="">Select</option>
                                                            <option value="1">January</option><option value="2">February</option>
                                                            <option value="3">March</option><option value="4">April</option>
                                                            <option value="5">May</option><option value="6">June</option>
                                                            <option value="7">July</option><option value="8">August</option>
                                                            <option value="9">September</option><option value="10">October</option>
                                                            <option value="11">November</option><option value="12">December</option>
                                                        </select>
                                                    </div>
                                                    <div class="col-md-2 form-group">
                                                        <label for="cm_year">Year</label>
                                                        <select id="cm_year" class="form-control"><option value="">Select</option></select>
                                                    </div>
                                                    <div class="col-md-2 form-group">
                                                        <label for="cm_costingHeader">Costing Header</label>
                                                        <select id="cm_costingHeader" class="form-control"><option value="">Select</option></select>
                                                    </div>
                                                    <div class="col-md-3 form-group cm-project-picker">
                                                        <label for="cm_projectButton">Project #</label>
                                                        <button type="button" id="cm_projectButton" class="form-control text-left">All Projects</button>
                                                        <div id="cm_projectMenu" class="cm-project-menu">
                                                            <input type="text" id="cm_projectSearch" class="form-control form-control-sm" placeholder="Search projects" autocomplete="off" />
                                                            <div id="cm_projectList" class="cm-project-list"></div>
                                                        </div>
                                                    </div>
                                                    <div class="col-md-2 form-group">
                                                        <label for="cm_amount">Amount</label>
                                                        <input type="number" id="cm_amount" class="form-control" min="0" step="0.01" placeholder="0.00" />
                                                    </div>
                                                    <div class="col-md-1 form-group d-flex align-items-end">
                                                        <button type="button" class="btn btn-primary" onclick="return cm_saveCosting();">Save</button>
                                                    </div>
                                                </div>
                                                <hr />
                                                <table class="table table-bordered" id="cm_costingTable" style="width: 100%;"></table>
                                            </div>
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
                <div class="modal fade" id="cm_historyModal" tabindex="-1" role="dialog" aria-labelledby="cm_historyModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-xl" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="cm_historyModalLabel">Costing History</h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                            </div>
                            <div class="modal-body"><table class="table table-bordered" id="cm_historyTable" style="width: 100%;"></table></div>
                            <div class="modal-footer"><button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</asp:Content>

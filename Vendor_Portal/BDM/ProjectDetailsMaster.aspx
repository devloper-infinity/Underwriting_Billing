<%@ Page Title="" Language="C#" MasterPageFile="~/BDM/BDM.Master" AutoEventWireup="true" CodeBehind="ProjectDetailsMaster.aspx.cs" Inherits="Vendor_Portal.BDM.ProjectDetailsMaster" %>

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
            bdmprojectmaster_bindgrid();
        });

        function bpm_addnewproject() {
            location.href = "ProjectDetails.aspx";
            return false;
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
                    <h6 class="m-0"><i class="fas fa-copy"></i>&nbsp;&nbsp;<b>Client Billing Template</b></h6>
                </div>
            </div>
        </div>
        <!-- /.container-fluid -->
    </div>
    <div class="col-lg-12">
        <div class="card">
            <div class="card-body">
                 <button id="bpm_btnaddnewproject" name="bpm_btnaddnewproject" class="btn btn-primary" onclick="return bpm_addnewproject();">Add New Project</button>
                <hr />
                <table class="table table-bordered" id="bpm_table" style="width:100%">
                    <thead>
                        <tr>
                            <th class="sort border-top ps-3" style="text-wrap: nowrap;display:none;">ProjectID</th>
                            <th class="sort border-top ps-3" style="text-wrap: nowrap; ">Edit</th>
                            <th class="sort border-top ps-3" style="text-wrap: nowrap;">Sr. #</th>
                            <th class="sort border-top ps-3" style="text-wrap: nowrap;">Project #</th>
                            <th class="sort border-top ps-3" style="text-wrap: nowrap;">Process</th>
                            <th class="sort border-top ps-3" style="text-wrap: nowrap;">Company</th>
                            <th class="sort border-top ps-3" style="text-wrap: nowrap; ">Contact Person</th>
                            <th class="sort border-top ps-3" style="text-wrap: nowrap; ">Contact #</th>
                            <th class="sort border-top ps-3" style="text-wrap: nowrap; ">Address</th>
                            <th class="sort border-top ps-3" style="text-wrap: nowrap; display:none;">Remark</th>
                        </tr>
                        
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
    </div>
</asp:Content>

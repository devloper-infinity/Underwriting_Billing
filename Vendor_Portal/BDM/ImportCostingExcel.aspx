<%@ Page Title="" Language="C#" MasterPageFile="~/BDM/BDM.Master" AutoEventWireup="true" CodeBehind="ImportCostingExcel.aspx.cs" Inherits="Vendor_Portal.BDM.ImportCostingExcel" %>

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
        window.onload = function () {
            document.getElementById('ice_attachment').addEventListener('change', getFileName);

        }
        const getFileName = (event) => {
            const files = event.target.files;
            var file = files[0];
            document.getElementById("ice_filep").value = files[0].name;

            const fd = new FormData();

            // add all selected files
            fd.append(event.target.name, file, file.name);
            // create the request
            const xhr = new XMLHttpRequest();

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                }
            };
            var url = window.location.href;
            // path to server would be where you'd normally post the form to
            xhr.open('POST', url, true);
            xhr.send(fd);
        }

        function ice_submit() {
            $("#waitingpanel").modal("show");
            var columns = [];
            $.ajax({
                url: "ImportCostingExcel.aspx/ImportExcel",
                type: "POST",
                dataType: "json",
                contentType: "application/json; charset=utf-8",

                success: function (data) {
                    dataArray = JSON.parse(data.d);
                    if ($.fn.dataTable.isDataTable('#ice_table')) {
                        $('#ice_table').DataTable().destroy();
                    }
                    columnNames = Object.keys(dataArray[0]); //.Table[0]] refers to the propery name of the returned json
                    for (var i in columnNames) {
                        columns.push({
                            data: columnNames[i],
                            title: columnNames[i]
                        });
                    }
                    $('#ice_table').DataTable({
                        dom: 't',
                        scrollX: true,
                        destroy: true,
                        paging: false,
                        "autoWidth": true,
                        select: true,
                        processing: true,
                        "aaSorting": [],
                        'select': {
                            'style': 'single'
                        },
                        "data": dataArray,
                        columns: columns,

                        initComplete: function () {
                            $("#waitingpanel").modal("hide");
                            document.getElementById("ice_btnverifyimport").style.display = '';
                        },
                    });

                }
            });

            return false;
        }

        function ice_verifyimport() {
            document.getElementById("spntext").innerHTML = "Costing import is in process. Please wait";
            $("#waitingpanel").modal("show");
            PageMethods.VerifyAndImport(ice_ver_OnSuccess, ice_ver_OnError);
            return false;
        }

        function ice_ver_OnSuccess(result) {
            $("#waitingpanel").modal("hide");
            if (result > 0) {
                document.getElementById("ice_errmsg").innerHTML = "Costing for deals/ process added successfully.";
                $('#ice_dverror').modal('show');
                return false;
            }
            else {
                document.getElementById("ice_errmsg").innerHTML = "Oops! System is facing connectivity issue. Please try after some time.";
                $('#ice_dverror').modal('show');
                return false;
            }
            return false;
        }
        function ice_ver_OnError(error) {
            alert(error.responseText);
        }

        function ice_MessageRedirect() {
            location.reload();
        }

    </script>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <input id="ice_filep" style="display: none;" />
    <div class="loading" id="load1">
        <img src="../images/Load_1.gif" />
        <div style="font-size: 12px; font-weight: bold;">One moment, please . . . .</div>
    </div>
    <div class="content-header">
        <div class="container">
            <div class="row mb-2 callout callout-info">
                <div class="col-sm-6">
                    <h6 class="m-0"><i class="fas fa-copy"></i>&nbsp;&nbsp;<b>Import Costing Excel</b></h6>
                </div>
                <div class="col-sm-6">
                    <ol class="breadcrumb float-sm-right" style="font-size: 12px; font-weight: bold;">
                        <li class="breadcrumb-item"><a href="../Formats/configuration.xlsx" id="aBack" runat="server" style="color: saddlebrown">Download Excel Format</a></li>
                    </ol>
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
                        <td style="width: 150px;"><b>Attachment:</b></td>
                        <td style="width: 320px;">
                            <input type="file" id="ice_attachment" name="ice_attachment" class="form-control" style="width: 300px;" />
                        </td>
                        <td>
                            <button id="ice_btnsubmit" name="ice_btnsubmit" class="btn btn-primary" onclick="return ice_submit();" style="display:inline;">Import</button>
                            <button id="ice_btnverifyimport" name="ice_btnverifyimport" class="btn btn-secondary" onclick="return ice_verifyimport();" style="display:none;">Verify and Submit</button>
                        </td>
                    </tr>
                </table>
                <hr />
                <table class="table table-bordered" id="ice_table" style="width: 100%">
                    <thead>
                        <tr>
                            <th class="sort border-top ps-3" style="text-wrap: nowrap;">System Remark</th>
                            <th class="sort border-top ps-3" style="text-wrap: nowrap;">Project #</th>
                            <th class="sort border-top ps-3" style="text-wrap: nowrap;">Deal #</th>
                            <th class="sort border-top ps-3" style="text-wrap: nowrap;">Copy From</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
    </div>

    <div class="modal fade" id="ice_dverror">
        <div class="modal-dialog modal-sm">
            <div class="modal-content">
                <div class="modal-header">
                    <h6 class="modal-title" id="ice_errmsg"></h6>
                </div>
                <div class="modal-footer align-content-center">
                    <button class="btn btn-primary" type="button" id="ice_btnMessage" onclick="return ice_MessageRedirect();">Okay</button>
                </div>
            </div>
            <!-- /.modal-content -->
        </div>
        <!-- /.modal-dialog -->
    </div>

    <div class="modal fade" id="waitingpanel" tabindex="-1" data-bs-backdrop="static" aria-hidden="true">
        <div class="modal-dialog text-center">
            <img src="../Images/Load.gif" />
            <br />
            <span style="color: #fff; font-size: 24px; font-weight: bold; font-style: italic;" id="spntext">System is validating excel file. Please wait</span>
            <span style="color: #fff; font-size: 48px; font-weight: bold; font-style: italic; animation: animate 1s linear infinite;">&nbsp;. . . .</span>
        </div>
    </div>
</asp:Content>

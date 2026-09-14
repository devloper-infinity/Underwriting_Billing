var ytbilled_table;
var ytbilled_html = '';
var senttoclient_table;

function blankForNull(s) {
    return s == "null" || s == null ? "" : s;

}

function GetBillingDetails(ProjectID, BillingPeriod, ProjectName, DomainID, Slot) {
    location.href = "SentToAccounts.aspx?ProjectID=" + ProjectID + "&BillingPeriod=" + BillingPeriod + "&ProjectName=" + ProjectName + "&DomainId=" + DomainID + "&Slot=" + Slot;
}

function BindBilledData() {
    $('#load1').show();
    ytbilled_html = '';
    $.ajax({
        url: "Yettobebilled.aspx/GetAllBilledProjects",
        type: "POST",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            var dataArray = JSON.parse(data.d);//

            $.each(dataArray, function (index, value) {
                ytbilled_html += '<tr>';
                ytbilled_html += '<td style="text-wrap: nowrap;display:none;">' + blankForNull(value.ProjectID) + '</td>';
                ytbilled_html += '<td style="text-wrap: nowrap;"><a class="dropdown-item" href="#!" id="ActionsEx" onclick="GetBillingDetails(' + value.ProjectID + ',\'' + value.BillingPeriod + '\',\'' + value.ProjectName1 + '\',9,' + value.Slot + ');"><span style="color: dodgerblue;"><i class="uil fs-0 me-2 uil-pen"></i></span></a></td>';
                ytbilled_html += '<td style="text-wrap: nowrap; text-align:center;">' + blankForNull((index + 1)) + '</td>';
                ytbilled_html += '<td style="text-wrap: nowrap; text-align:center;">' + blankForNull(value.ProjectName1) + '</td>';
                ytbilled_html += '<td style="text-wrap: nowrap;">' + blankForNull(value.ProcessName) + '</td>';
                ytbilled_html += '<td style="text-wrap: nowrap;">' + blankForNull(value.BillingPeriod) + '</td>';
                ytbilled_html += '<td style="text-wrap: nowrap; text-align:center;">' + blankForNull(value.TYPE) + '</td>';

                ytbilled_html += '<td style="text-wrap: nowrap; text-align:center;">' + blankForNull(value.Slot) + '</td>';

                ytbilled_html += '<td style="text-wrap: nowrap; text-align:center;">' + blankForNull(value.Slot) + '</td>';

                ytbilled_html += '<td style="text-wrap: nowrap; text-align:center;">' + blankForNull(value.Cnt) + '</td>';
                ytbilled_html += '<td style="text-wrap: nowrap; display:none;">' + blankForNull(value.DealTotalCount) + '</td>';
                ytbilled_html += '<td style="text-wrap: nowrap; text-align:center;">' + blankForNull(value.AddedDate) + '</td>';
                ytbilled_html += '<td style="text-wrap: nowrap; text-align:center;">' + blankForNull(value.Status1) + '</td>';
                ytbilled_html += '</tr>';
            });
            if ($.fn.dataTable.isDataTable('#ytbilled_table')) {
                ytbilled_table.destroy();
            }

            $('#ytbilled_table tbody').html(ytbilled_html);
            //else
            ytbilled_table = $('#ytbilled_table').DataTable({
                dom: 'ftp',
                destroy: true,
                "paging": false,
                "autoWidth": true,
                select: true,
                "ordering": false,
                processing: true,
                'select': {
                    'style': 'single'
                },

                initComplete: function () {
                    $('#load1').hide();
                },
            });

            //$('#fnalize tbody').on('click', 'tr', function () {
            //    row = table.row(this).data();
            //});
        },
        error: function (error) {
            alert('error; ' + eval(error));
            alert('error; ' + error.responseText);
        }
    });
    return false;
}

function BindBillingDetailsHeader() {
    const urlParams = new URLSearchParams(window.location.search);
    const ProjectID = urlParams.get('ProjectID');
    const BillingPeriod = urlParams.get('BillingPeriod');
    const ProjectName = urlParams.get('ProjectName');
    const DomainID = urlParams.get('DomainID');
    document.getElementById("billdetails_header_projectno").innerHTML = "Project #: " + ProjectName;
    document.getElementById("billdetails_header_billingperiod").innerHTML = "Billing Period: " + BillingPeriod;

    document.getElementById("sendbackprod_projectno").innerHTML = ProjectName;
    document.getElementById("sendbackprod_billingperiod").innerHTML = BillingPeriod;

}

function BindBillingDataGrid() {
    $('#load1').show();
    const urlParams = new URLSearchParams(window.location.search);
    const ProjectID = urlParams.get('ProjectID');
    const BillingPeriod = urlParams.get('BillingPeriod');
    const ProjectName = urlParams.get('ProjectName');
    const DomainID = urlParams.get('DomainID');
    const Slot = urlParams.get('Slot');
    var columns = [];
    var TotalCharges = 0;
    var TotalOrders = 0;
    var filename = ProjectName + '-' + BillingPeriod;
    $.ajax({
        url: "SentToAccounts.aspx/GetTotalProjectAmount",
        type: "POST",
        data: "{ProjectID:" + ProjectID + ", ProjectName:'" + ProjectName + "', BillingPeriod:'" + BillingPeriod + "', Slot:'" + Slot + "'}",
        dataType: "json",
        contentType: "application/json; charset=utf-8",

        success: function (data) {
            if ($.fn.dataTable.isDataTable('#senttoaccount_table')) {
                $('#senttoaccount_table').DataTable().destroy();
            }
            dataArray = JSON.parse(data.d);
            $.each(dataArray, function (index, value) {
                TotalCharges += parseFloat(value.TotalCharges);
                TotalOrders += 1;
            });
            if (ProjectID == 464)
                document.getElementById("senttoaccount_btnexportloanlist").style.display = '';
            else
                document.getElementById("senttoaccount_btnexportloanlist").style.display = 'none';

            document.getElementById("billdetails_header_ordercount").innerHTML = "Loan Count: " + TotalOrders;
            document.getElementById("billdetails_header_totalamount").innerHTML = 'Amount: <span style="color:red;">' + parseFloat(TotalCharges).toFixed(2);
            document.getElementById("billdetails_header_totalamount_hidden").innerHTML = parseFloat(TotalCharges).toFixed(2);
            columnNames = Object.keys(dataArray[0]); //.Table[0]] refers to the propery name of the returned json
            for (var i in columnNames) {
                columns.push({
                    data: columnNames[i],
                    title: columnNames[i]
                });
            }
            $('#senttoaccount_table').DataTable({
                dom: 'Bftip',
                destroy: true,
                orderCellsTop: true,
                fixedColumns: {
                    leftColumns: 2,
                },
                fixedHeader: true,
                scrollCollapse: true,
                scrollX: true,
                scrollY: '350px',
                "paging": false,
                "autoWidth": true,
                select: true,
                "ordering": false,
                processing: true,
                filter: true,
                'select': {
                    'style': 'single'
                },
                "serverSide": false,
                "data": dataArray,
                columns: columns,
                buttons: [
                    {
                        extend: 'excelHtml5', title: filename, autoFilter: true,
                    },


                ],
                initComplete: function () {
                    $('#load1').hide();
                    //document.getElementById('billdetails_header_totalamount').innerHTML = "Total Orders: " + dataArray.length;
                },
                //drawCallback: function () {
                //    var sum = $('#senttoaccount_table').DataTable().column("TotalCharges").data().sum();
                //    alert(sum);
                //    document.getElementById('billdetails_header_totalamount').innerHTML = sum;
                //},
            });

        }
    });

    return false;
}

function BindBillingDataGrid_Revised() {
    $('#load1').show();
    const urlParams = new URLSearchParams(window.location.search);
    const ProjectID = urlParams.get('ProjectID');
    const BillingPeriod = urlParams.get('BillingPeriod');
    const ProjectName = urlParams.get('ProjectName');
    const DomainID = urlParams.get('DomainID');
    //const Slot = urlParams.get('Slot');
    var columns = [];
    var TotalCharges = 0;
    var TotalOrders = 0;
    var filename = ProjectName + '-' + BillingPeriod;
    $.ajax({
        url: "SentToAccounts_Revised.aspx/GetMergedBillingSummary_Revised",
        type: "POST",
        // data: "{ProjectID:" + ProjectID + ", ProjectName:'" + ProjectName + "', BillingPeriod:'" + BillingPeriod + "', Slot:'" + Slot + "'}",
        data: "{ProjectId:" + ProjectID + ", BillingPeriod:'" + BillingPeriod + "'}",
        dataType: "json",
        contentType: "application/json; charset=utf-8",

        success: function (data) {

            if ($.fn.dataTable.isDataTable('#senttoaccount_table')) {
                $('#senttoaccount_table').DataTable().destroy();
            }
            dataArray = JSON.parse(data.d);
            $.each(dataArray, function (index, value) {
                TotalCharges += parseFloat(value.Total);
                TotalOrders += parseFloat(value.LoanCount);
            });
            if (ProjectID == 464)
                document.getElementById("senttoaccount_btnexportloanlist").style.display = '';
            else
                document.getElementById("senttoaccount_btnexportloanlist").style.display = 'none';

            document.getElementById("billdetails_header_ordercount").innerHTML = "Loan Count: " + TotalOrders;
            document.getElementById("billdetails_header_totalamount").innerHTML = 'Amount: <span style="color:red;">' + parseFloat(TotalCharges).toFixed(2);
            document.getElementById("billdetails_header_totalamount_hidden").innerHTML = parseFloat(TotalCharges).toFixed(2);
            columnNames = Object.keys(dataArray[0]); //.Table[0]] refers to the propery name of the returned json
            for (var i in columnNames) {
                columns.push({
                    data: columnNames[i],
                    title: columnNames[i]
                });
            }
            $('#senttoaccount_table').DataTable({
                dom: 'Bftip',
                destroy: true,
                orderCellsTop: true,
                fixedColumns: {
                    leftColumns: 2,
                },
                fixedHeader: true,
                scrollCollapse: true,
                scrollX: true,
                scrollY: '350px',
                "paging": false,
                "autoWidth": true,
                select: true,
                "ordering": false,
                processing: true,
                filter: true,
                'select': {
                    'style': 'single'
                },
                "serverSide": false,
                "data": dataArray,
                columns: columns,
                buttons: [
                    {
                        extend: 'excelHtml5', title: filename, autoFilter: true,
                    },


                ],
                columnDefs: [
                    {
                        targets: 0,
                        visible: false,
                    },
                ],
                initComplete: function () {
                    $('#load1').hide();
                    //document.getElementById('billdetails_header_totalamount').innerHTML = "Total Orders: " + dataArray.length;
                },
                //drawCallback: function () {
                //    var sum = $('#senttoaccount_table').DataTable().column("TotalCharges").data().sum();
                //    alert(sum);
                //    document.getElementById('billdetails_header_totalamount').innerHTML = sum;
                //},
            });

        }
    });

    return false;
}

function BindSendtoClient() {
    $('#load1').show();
    const urlParams = new URLSearchParams(window.location.search);
    var columns = [];

    $.ajax({
        url: "SentToClient.aspx/GetAllSentToClientList",
        type: "POST",
        dataType: "json",
        contentType: "application/json; charset=utf-8",

        success: function (data) {
            if ($.fn.dataTable.isDataTable('#senttoclient_table')) {
                $('#senttoclient_table').DataTable().destroy();
            }
            dataArray = JSON.parse(data.d);

            $('#senttoclient_table').DataTable({
                dom: 'Bftp',
                scrollX: true,
                destroy: true,
                paging: true,
                "autoWidth": true,
                select: true,
                processing: true,
                "aaSorting": [],
                'select': {
                    'style': 'single'
                },
                "data": dataArray,
                columns: [
                    { data: '' },
                    { data: 'ProjectID' },
                    { data: 'InvoiceID' },
                    { data: 'ProjectName' },
                    { data: 'InvoiceName' },
                    { data: 'InvoiceNumber' },
                    { data: 'InvoiceDate' },
                    { data: 'LoanCount' },
                    { data: 'TotalAmount' },
                    { data: 'Slot' }

                ],
                columnDefs: [
                    {
                        targets: 0,
                        "width": "45px",
                        render: function (data, type, row, meta) {
                            return '<a class="dropdown-item" title="Download PDF Invoice" href="#!" id="Actions" onclick="senttoclient_downloadpdf(\'' + meta.row + '\');" style="width:30px; display:inline;padding: .25rem .25rem!important;"><img src="../Images/pdf.png" style="width:20px; display:inline;" /></a>' +
                                '<a class="dropdown-item" title="Download Details Excel" href="#!" id="ActionsEx" onclick="senttoclient_downloadexcel(\'' + meta.row + '\');" style="width:30px; display:inline;padding: .25rem .25rem!important;"><img src="../Images/excel.png" style="width:20px; display:inline;" /></a>' +
                                '<a class="dropdown-item" title="Update Invoice Details" href="#!" id="Actionsupdate" onclick="senttoclient_updateinvoice(\'' + meta.row + '\');" style="width:30px; display:inline;padding: .25rem .25rem!important;"><img src="../Images/edit.png" style="width:20px; display:inline;" /></a>';

                            //                            return '<input type="checkbox" class="dropdown-item" href="#!" id="' + row.Code + '" onclick="GetCheckedCheckboxes_incstep1(this);" />';
                            //return '<input type="button" class="btn-primary" id=viewdetails-"' + meta.row + '" value="Details" onclick="return ViewPolicyDetails(\'' + meta.row + '\');" />&nbsp;<input type="button" class="btn-default" id=viewtasks-"' + meta.row + '" value="Tasks"  onclick="return ViewTaskDetails(\'' + meta.row + '\');"/>';
                        }
                    },
                    {
                        targets: 1,
                        visible: false,
                    }
                    ,
                    {
                        targets: 2,
                        visible: false,
                    }
                    ,
                    {
                        targets: 9,
                        visible: false,
                    }

                ],
                fnCreatedRow: function (nRow, aData, iDataIndex) {
                    $(nRow).children("td").css("text-wrap", "nowrap");
                },

                initComplete: function () {
                    $('#load1').hide();

                },
                //drawCallback: function () {
                //    var sum = $('#senttoaccount_table').DataTable().column("TotalCharges").data().sum();
                //    alert(sum);
                //    document.getElementById('billdetails_header_totalamount').innerHTML = sum;
                //},
            });

        }
    });

    return false;
}

function senttoclient_updateinvoice(row) {
    var rows = $('#senttoclient_table').DataTable().rows(row).data();
    document.getElementById("updateinvoice_projectno").innerHTML = rows[0].ProjectName;
    document.getElementById("updateinvoice_billingperiod").innerHTML = rows[0].InvoiceName;
    $("#updateinvoicedetails").modal("show");
}

function senttoclient_downloadpdf(index) {
    $("#waitingpanel").modal("show");
    document.getElementById("spntext").innerHTML = "Document generation is in process. Please wait";
    var rows = $('#senttoclient_table').DataTable().row(index).data();
    PageMethods.GenerateInvoice(rows.ProjectID, rows.InvoiceName, rows.Slot, rows.InvoiceID, geninvoice_OnSuccess, geninvoice_OnError);
    return false;

}

function geninvoice_OnSuccess(result) {
    $("#waitingpanel").modal("hide");
    downloadreport_senttoclient();
    return false;
}
function geninvoice_OnError(error) {
    alert(error.responseText);
}

function senttoclient_downloadexcel(index) {
    $('#waitingpanel').modal('show');
    document.getElementById("spntext").innerHTML = "Downloading Excel. Please wait";
    var rows = $('#senttoclient_table').DataTable().row(index).data();
    PageMethods.GenerateExcel(rows.ProjectID, rows.InvoiceName, rows.Slot, rows.InvoiceID, genexcel1_OnSuccess, genexcel1_OnError);
    return false;
}

function genexcel1_OnSuccess(result) {
    $("#waitingpanel").modal("hide");
    downloadexcel_senttoclient();
    return false;
}
function genexcel1_OnError(error) {
    alert(error.responseText);
}

function senttoaccount_updateinvoicenumber() {
    if (document.getElementById("senttoaccount_chkinvoicenumber").checked == true) {
        document.getElementById("senttoaccount_invoicenumber").disabled = false;
    }
    else
        document.getElementById("senttoaccount_invoicenumber").disabled = true;
}

function senttoaccount_generateinvoicenumber() {
    const urlParams = new URLSearchParams(window.location.search);
    const ProjectID = urlParams.get('ProjectID');
    const BillingPeriod = urlParams.get('BillingPeriod');
    const ProjectName = urlParams.get('ProjectName');
    $.ajax({
        url: "SentToAccounts.aspx/GetInvoiceNumber",
        type: "POST",
        data: "{ProjectID:" + ProjectID + ", ProjectName:'" + ProjectName + "', BillingPeriod:'" + BillingPeriod + "'}",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            var dataArray = JSON.parse(data.d);//
            $.each(dataArray, function (index, value) {
                document.getElementById("senttoaccount_invoicenumber").value = blankForNull(value.InvoiceNumber);
                document.getElementById("senttoaccount_invoicenumber").disabled = true;
            });
        },
        error: function (error) {
            alert('error; ' + eval(error));
            alert('error; ' + error.responseText);
        }
    });
}

function senttoaccount_exportloanlist(index) {
    $('#waitingpanel').modal('show');
    document.getElementById("spntext").innerHTML = "Downloading Excel. Please wait";
    const urlParams = new URLSearchParams(window.location.search);
    const BillingPeriod = urlParams.get('BillingPeriod');
    PageMethods.GenerateLoanListExcel(BillingPeriod, genloanlist_OnSuccess, genloanlist_OnError);
    return false;
}

function genloanlist_OnSuccess(result) {
    $("#waitingpanel").modal("hide");
    exportloanlist_senttoaccount();
    return false;
}
function genloanlist_OnError(error) {
    alert(error.responseText);
}


function senttoaccount_eGetVerifiedStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    const ProjectID = urlParams.get('ProjectID');
    const BillingPeriod = urlParams.get('BillingPeriod');
    const DomainID = urlParams.get('DomainID');
    const Slot = urlParams.get('Slot');
    PageMethods.GetBillingPeriodVerifiedStatus(ProjectID, BillingPeriod, Slot, senttoaccout_verifyStatus_OnSuccess, senttoaccout_verifyStatus_OnError);
    return false;
}
function senttoaccout_verifyStatus_OnSuccess(result) {
    if (result > 0) {
        document.getElementById("senttoaccount_btnverifyorders").classList.add("disabled");
        document.getElementById("senttoaccount_btnverifyorders").disabled = true;
    }
    else {
        document.getElementById("senttoaccount_btnverifyorders").classList.remove("disabled");
        document.getElementById("senttoaccount_btnverifyorders").disabled = false;
    }
    return false;
}
function senttoaccout_verifyStatus_OnError(error) {
    alert(error.responseText);
}

function senttoaccount_verifyorders() {
    const urlParams = new URLSearchParams(window.location.search);
    const ProjectID = urlParams.get('ProjectID');
    const BillingPeriod = urlParams.get('BillingPeriod');
    const ProjectName = urlParams.get('ProjectName');
    const DomainID = urlParams.get('DomainID');
    const Slot = urlParams.get('Slot');
    PageMethods.VerifyOrders(ProjectID, ProjectName, BillingPeriod, Slot, senttoaccout_verify_OnSuccess, senttoaccout_verify_OnError);
    return false;
}
function senttoaccout_verify_OnSuccess(result) {
    alert("Orders verified successfully.");
    senttoaccount_eGetVerifiedStatus();
    return false;
}
function senttoaccout_verify_OnError(error) {
    alert(error.responseText);
}

function senttoaccount_senttoclient() {
    const urlParams = new URLSearchParams(window.location.search);
    alert(urlParams);
    const ProjectID = urlParams.get('ProjectID');
    alert(ProjectID);
    const BillingPeriod = urlParams.get('BillingPeriod');
    alert(BillingPeriod);
    const ProjectName = urlParams.get('ProjectName');
    alert(ProjectName);
    const DomainID = urlParams.get('DomainId');
    alert(DomainID);
    const Slot = urlParams.get('Slot');
    alert(Slot);
    var amount = document.getElementById("billdetails_header_totalamount").innerHTML;
    amount = amount.replace('Amount: <span style="color:red;">', "");
    amount = amount.replace('</span>', "");
    alert(amount);
    var ordercount = document.getElementById("billdetails_header_ordercount").innerHTML;
    ordercount = ordercount.replace('Loan Count: ', "");
    alert(ordercount);
    var ismanual = document.getElementById("senttoaccount_chkinvoicenumber").checked;
    var invoicenumber = document.getElementById("senttoaccount_invoicenumber").value;
    alert(invoicenumber);


    PageMethods.Sendtoclient(ProjectID, ProjectName, BillingPeriod, amount, ordercount, ismanual, invoicenumber, senttoaccount_senttoclient_OnSuccess, senttoaccount_senttoclient_OnError);
    return false;
}
function senttoaccount_senttoclient_OnSuccess(result) {
    if (result > 0) {
        location.href = "Yettobebilled_Revised.aspx";
    }
    else {
        alert("Error occured while sending billing to client. Please contact administrator.");
    }
    return false;
}
function senttoaccount_senttoclient_OnError(error) {
    alert(error.responseText);
}

function senttoaccount_sendtoproduction() {
    $("#sendbacktoproduction").modal("show");
    return false;
}
function senttoaccount_sentbacktoproduction() {
    var reason = document.getElementById("senttoaccount_sendback_reason").value;
    if (reason == "") {
        alert("Please enter reason.");
        document.getElementById("senttoaccount_sendback_reason").focus();
        return false;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const ProjectID = urlParams.get('ProjectID');
    const BillingPeriod = urlParams.get('BillingPeriod');
    const ProjectName = urlParams.get('ProjectName');
    PageMethods.SendBackToProduction(ProjectID, ProjectName, BillingPeriod, reason, sendback_mail_OnSuccess, sendback_mail_OnError);
    return false;
}

function sendback_mail_OnSuccess(result) {
    if (result > 0) {
        alert("Billing rolled back successfully.");
        location.href = "Yettobebilled.aspx";
        return false;
    }
    else {
        alert("Error occured while sending billing back to production. Please contact administrator.");
        return false;
    }
    return false;
}
function sendback_mail_OnError(error) {
    alert(error.responseText);
}


//Add Invoice - START

function addinvoice_bindinvoicegrid() {
    $('#load1').show();
    var addinvoice_html = '';
    $.ajax({
        url: "AddInvoice.aspx/GetAllDirectBilledInvoices",
        type: "POST",
        dataType: "json",
        contentType: "application/json; charset=utf-8",

        success: function (data) {
            if ($.fn.dataTable.isDataTable('#addinvocie_table')) {
                $('#addinvocie_table').DataTable().destroy();
            }
            dataArray = JSON.parse(data.d);
            $('#addinvocie_table').DataTable({
                dom: 'ftp',
                scrollX: true,
                destroy: true,
                paging: true,
                "autoWidth": true,
                select: true,
                fixedHeader: true,
                processing: true,
                "aaSorting": [],
                'select': {
                    'style': 'single'
                },
                "data": dataArray,
                columns: [
                    { data: 'Name' },
                    { data: 'InvoiceDate' },
                    { data: 'ClientName' },
                    //{ data: 'TotalFiles' },
                    //{ data: 'TotalAmount' },
                    { data: 'SecCount' },
                    { data: 'SecTotal' },
                    { data: 'RelCount' },
                    { data: 'RelTotal' },
                    { data: 'ThirdPartyRevenue' }
                ],

                initComplete: function () {
                    $('#load1').hide();
                },

            });

        }
    });

    return false;
}

function addinvoice_direct_submit() {
    var name = document.getElementById("addinvoice_name").value;
    var invoicedate = document.getElementById("addinvoice_invoicedate").value;
    var ddlclient = document.getElementById("addinvoice_clientnamelist");
    var clientname = ddlclient.options[ddlclient.selectedIndex].text;
    var projectid = ddlclient.options[ddlclient.selectedIndex].value;
    //var clientname = document.getElementById("addinvoice_clientname").value;
    var totalfiles = document.getElementById("addinvoice_filecompleted").value;
    var totalamount = document.getElementById("addinvoice_totalamount").value;
    var secrelletter = document.getElementById("addinvoice_secreliance").value;
    var thirdpartyrevenue = document.getElementById("addinvoice_thirdpartyrevenue").value;
    var seccount = document.getElementById("addinvoice_secloancount").value;
    var secamount = document.getElementById("addinvoice_secamount").value;
    var relcount = document.getElementById("addinvoice_relloancount").value;
    var relamount = document.getElementById("addinvoice_relamount").value;
    PageMethods.InsertDirectBilling(name, invoicedate, clientname, totalfiles, totalamount, secrelletter, thirdpartyrevenue, seccount, secamount, relcount, relamount, projectid, addinvoice_direct_OnSuccess, addinvoice_direct_OnError);
    return false;
}

function addinvoice_direct_OnSuccess(result) {
    if (result > 0) {
        alert("Invoice Added Successfully.");
        location.href = "AddInvoice.aspx";
        return false;
    }
    else {
        alert("Error occured while adding invoice. Please contact administrator.");
        return false;
    }
    return false;
}
function addinvoice_direct_OnError(error) {
    alert(error.responseText);
}

function addinvoice_bindinvoicegrid_1() {
    $('#load1').show();
    var addinvoice_html = '';
    $.ajax({
        url: "Yettobebilled.aspx/GetYetobeBilled",
        type: "POST",
        dataType: "json",
        contentType: "application/json; charset=utf-8",

        success: function (data) {
            if ($.fn.dataTable.isDataTable('#addinvocie_table_1')) {
                $('#addinvocie_table_1').DataTable().destroy();
            }
            dataArray = JSON.parse(data.d);
            $('#addinvocie_table_1').DataTable({
                dom: 'ftp',
                scrollX: true,
                destroy: true,
                paging: false,
                "autoWidth": true,
                select: true,
                fixedHeader: true,
                processing: true,
                "aaSorting": [],
                'select': {
                    'style': 'single'
                },
                "data": dataArray,
                columns: [
                    { data: '' },
                    { data: 'ProjectID' },
                    { data: 'ProjectName' },
                    { data: 'BillingPeriod' },
                    /*{ data: 'Slot' },*/
                    { data: 'LoanCount' },
                    { data: 'Securitization' },
                    { data: 'RelianceLetter' },
                    { data: 'BillingSentDate' },
                    { data: 'Status1' },
                    { data: 'TrackingSheetID' },
                    { data: 'Attachment' }
                ],
                columnDefs: [
                    {
                        targets: 0,
                        "width": "45px",
                        render: function (data, type, row, meta) {
                            //return '<a class="dropdown-item" href="#!" id="Actions"><span style="color: dodgerblue;"><i class="uil fs-0 me-2 uil-pen"></i></span></a>';
                            return '<a  style="display:inline; font-size:15px; padding-right:10px;" title="View Details" href="#!" id="Actions" onclick="addinvoice_viewdetails(' + meta.row + ');">' +
                                '<span style="color: forestgreen;"><i class="uil fs-0 me-2 uil-search-alt"></i></span></a>' +
                                '<a href="#!" id="ActionsEx" title="Downalod Attachment" onclick="addinvoice_Download(' + meta.row + ');" style="display:none; font-size:15px;"><span style="color: dodgerblue;">' +
                                '<i class="uil fs-0 me-2 uil-file"></i></span></a><a href="#!" id="Actions" style="display:none;">' +
                                '<span style="color: forestgreen;"><i class="uil fs-0 me-2 uil-download-alt"></i></span>&nbsp;&nbsp;Issue to Client</a>'
                            //return '<input type="button" class="btn-primary" id=viewdetails-"' + meta.row + '" value="Details" onclick="return ViewPolicyDetails(\'' + meta.row + '\');" />&nbsp;<input type="button" class="btn-default" id=viewtasks-"' + meta.row + '" value="Tasks"  onclick="return ViewTaskDetails(\'' + meta.row + '\');"/>';
                        }

                    }
                    ,
                    {
                        targets: 1,
                        visible: false,
                    },
                    {
                        targets: 9,
                        visible: false,
                    },
                    {
                        targets: 10,
                        visible: false,
                    }
                ],
                initComplete: function () {
                    $('#load1').hide();
                },
            });
        }
    });

    return false;
}

function addinvoice_bindinvoicegrid_Revised() {
    $('#load1').show();
    var addinvoice_html = '';
    $.ajax({
        url: "Yettobebilled_Revised.aspx/GetYetobeBilled",
        type: "POST",
        dataType: "json",
        contentType: "application/json; charset=utf-8",

        success: function (data) {
            if ($.fn.dataTable.isDataTable('#addinvocie_table_1')) {
                $('#addinvocie_table_1').DataTable().destroy();
            }
            dataArray = JSON.parse(data.d);
            $('#addinvocie_table_1').DataTable({
                dom: 'ftp',
                scrollX: true,
                destroy: true,
                paging: false,
                "autoWidth": true,
                select: true,
                fixedHeader: true,
                processing: true,
                "aaSorting": [],
                'select': {
                    'style': 'single'
                },
                "data": dataArray,
                columns: [
                    { data: '' },
                    { data: 'ProjectID' },
                    { data: 'ProjectName' },
                    { data: 'BillingPeriod' },
                    { data: 'LoanCount' },
                    { data: 'Securitization' },
                    { data: 'RelianceLetter' },
                    { data: 'BillingSentDate' },
                    { data: 'Status1' }
                ],
                columnDefs: [
                    {
                        targets: 0,
                        "width": "45px",
                        render: function (data, type, row, meta) {
                            //return '<a class="dropdown-item" href="#!" id="Actions"><span style="color: dodgerblue;"><i class="uil fs-0 me-2 uil-pen"></i></span></a>';
                            return '<a  style="display:inline; font-size:15px; padding-right:10px;" title="View Details" href="#!" id="Actions" onclick="addinvoice_viewdetails_Revised(' + meta.row + ');">' +
                                '<span style="color: forestgreen;"><i class="uil fs-0 me-2 uil-search-alt"></i></span></a>' +
                                '<a href="#!" id="ActionsEx" title="Downalod Attachment" onclick="addinvoice_Download(' + meta.row + ');" style="display:none; font-size:15px;"><span style="color: dodgerblue;">' +
                                '<i class="uil fs-0 me-2 uil-file"></i></span></a><a href="#!" id="Actions" style="display:none;">' +
                                '<span style="color: forestgreen;"><i class="uil fs-0 me-2 uil-download-alt"></i></span>&nbsp;&nbsp;Issue to Client</a>'
                            //return '<input type="button" class="btn-primary" id=viewdetails-"' + meta.row + '" value="Details" onclick="return ViewPolicyDetails(\'' + meta.row + '\');" />&nbsp;<input type="button" class="btn-default" id=viewtasks-"' + meta.row + '" value="Tasks"  onclick="return ViewTaskDetails(\'' + meta.row + '\');"/>';
                        }

                    }
                    ,
                    {
                        targets: 1,
                        visible: false,
                    }
                ],
                initComplete: function () {
                    $('#load1').hide();
                },
            });
        }
    });

    return false;
}

function senttoaccount_previewinvoice() {
    $("#waitingpanel").modal("show");
    var amount = document.getElementById("billdetails_header_totalamount_hidden").innerHTML;
    PageMethods.GenerateInvoice(amount, geninv_OnSuccess, geninv_OnError);
    return false;
}
function geninv_OnSuccess(result) {
    $("#waitingpanel").modal("hide");
    downloadreport();
    //alert(result);
    //if (result > 0) {
    //    return false;
    //}
    //else {
    //    alert("Error occured while downloading invoice. Please contact administrator.");
    //    return false;
    //}
    return false;
}
function geninv_OnError(error) {
    alert(error.responseText);
}

function addinvoice_viewdetails(Index) {
    var row = $('#addinvocie_table_1').DataTable().row(Index).data();
    var ProjectID = row.ProjectID;
    var BillingPeriod = row.BillingPeriod;
    var ProjectName = row.ProjectName;
    var Slot = row.Slot;

    location.href = "SentToAccounts.aspx?ProjectID=" + ProjectID + "&BillingPeriod=" + BillingPeriod + "&ProjectName=" + ProjectName + "&DomainId=9&Slot=" + Slot;
}

function addinvoice_viewdetails_Revised(Index) {
    var row = $('#addinvocie_table_1').DataTable().row(Index).data();
    var ProjectID = row.ProjectID;
    var BillingPeriod = row.BillingPeriod;
    var ProjectName = row.ProjectName;
    var flag = row.Flag;
    //var Slot = row.Slot;
   // if (flag == "0")
    if (ProjectID==70)
        location.href = "SentToAccounts_Revised.aspx?ProjectID=" + ProjectID + "&BillingPeriod=" + BillingPeriod + "&ProjectName=" + ProjectName + "&DomainId=9";
    else
        location.href = "SentToAccounts.aspx?ProjectID=" + ProjectID + "&BillingPeriod=" + BillingPeriod + "&ProjectName=" + ProjectName + "&DomainId=9&Slot=0";
}

function addinvoice_Download(Index) {
    var row = $('#addinvocie_table_1').DataTable().row(Index).data();
    var trckID = row.TrackingSheetID;
    var fileurl = row.Attachment;

    if (fileurl == "" || fileurl == null) {
        alert("No attachment found.");
        return;
    }

    var lastindex = row.Attachment.lastIndexOf('\\');
    var filename = row.Attachment.substring(lastindex + 1, row.Attachment.length);
    var url = '/DownloadAttachment';
    var currenturl = window.location.href;
    var urlindex = currenturl.lastIndexOf('/');
    var firstpart = currenturl.substring(0, urlindex + 1);
    var secondpart = "DownloadFiles.aspx?TrackingSheetID=" + trckID;
    var actualurl = firstpart + secondpart;
    fetch(actualurl)
        // check to make sure you didn't have an unexpected failure (may need to check other things here depending on use case / backend)
        .then(resp => resp.status === 200 ? resp.blob() : Promise.reject('something went wrong'))
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            // the filename you want
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            // or you know, something with better UX...
            //alert('your file has downloaded!');
        })
        .catch(() => alert('Oops! It seems that there is an error while retriving attachment. Please contact administrator.'));
}

function addinvoice_bindcompany() {
    var select = document.getElementById("addinvoice_clientnamelist");
    let options = select.getElementsByTagName('option');

    for (var i = options.length; i--;) {
        select.removeChild(options[i]);
    }
    $("#addinvoice_clientnamelist").append($("<option></option>").val("").html("Select"));
    $.ajax({
        type: "POST", url: "Addinvoice.aspx/GetAllClientList", dataType: "json", contentType: "application/json",
        success: function (res) {
            var dataArray = JSON.parse(res.d);
            $.each(dataArray, function (data, value) {
                $("#addinvoice_clientnamelist").append($("<option></option>").val(value.ProjectID).html(value.ClientName));
            })
        }
    });
}

// Add Invoice - END



var cbdr_ddsummary;
var cbdr_dddetails;
var cbdr_nonddsummary;
var cbdr_nondddetails;
var cbdr_canopysummary;
var cbdr_canopydetails;

var cprr_userwise;
var cprr_domainwise;
var cprr_projectwise;

function blankForNull(s) {
    return s == "null" || s == null ? "" : s;
}

function diff_bindyear() {
    var start = new Date().getFullYear();

    var select = document.getElementById("diff_year");
    let options = select.getElementsByTagName('option');

    for (var i = options.length; i--;) {
        select.removeChild(options[i]);
    }

    $("#diff_year").append($("<option></option>").val("").html("Select"));
    for (var i = start; i > start - 5; i--) {
        $("#diff_year").append($("<option></option>").val(i).html(i));
    }
}

function cppr_bindyear() {
    var start = new Date().getFullYear();

    var select = document.getElementById("cppr_year");
    let options = select.getElementsByTagName('option');

    for (var i = options.length; i--;) {
        select.removeChild(options[i]);
    }

    $("#cppr_year").append($("<option></option>").val("").html("Select"));
    for (var i = start; i > start - 5; i--) {
        $("#cppr_year").append($("<option></option>").val(i).html(i));
    }
}

function apbr_bindgrid_Working() {
    var fromdate = document.getElementById("apbr_fromdate").value;
    var todate = document.getElementById("apbr_todate").value;
    $('#load1').show();
    $.ajax({
        url: "AllProjectBillingReport.aspx/GetAllProjectBilingReport",
        type: "POST",
        dataType: "json",
        data: "{FromDate:'" + fromdate + "',ToDate:'" + todate + "'}",
        contentType: "application/json; charset=utf-8",

        success: function (data) {
            if ($.fn.dataTable.isDataTable('#apbr_table')) {
                $('#apbr_table').DataTable().destroy();
            }
            dataArray = JSON.parse(data.d);
            $('#apbr_table').DataTable({
                dom: 'Btp',
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
                    { data: 'Domain' },
                    { data: 'Subdomain' },
                    { data: 'ProjectName' },
                    { data: 'BillingPeriod' },
                    { data: 'InvoiceNo' },
                    { data: 'OrderCount' },
                    { data: 'TotalAmount' },
                    { data: 'InvoiceGeneratedOn' }
                ],
                fnCreatedRow: function (nRow, aData, iDataIndex) {

                    $(nRow).children("td").css("text-align", "center");
                },

                initComplete: function () {
                    $('#load1').hide();
                },
                buttons: [
                    {
                        extend: 'excelHtml5', title: 'All project Billing Report', autoFilter: true,
                    },
                ],

            });

        }
    });

    return false;
}

function apbr_bindgrid_V1() {
    var fromdate = document.getElementById("apbr_fromdate").value;
    var todate = document.getElementById("apbr_todate").value;

    $('#load1').show();

    $.ajax({
        url: "AllProjectBillingReport.aspx/GetAllProjectBilingReport",
        type: "POST",
        dataType: "json",
        data: "{FromDate:'" + fromdate + "',ToDate:'" + todate + "'}",
        contentType: "application/json; charset=utf-8",

        success: function (data) {

            if ($.fn.dataTable.isDataTable('#apbr_table')) {
                $('#apbr_table').DataTable().destroy();
            }

            var dataArray = JSON.parse(data.d);

            $('#apbr_table').DataTable({
                dom: 'Btp',
                scrollX: true,
                destroy: true,
                paging: false,
                autoWidth: true,
                select: true,
                fixedHeader: true,
                processing: true,
                aaSorting: [],

                select: {
                    style: 'single'
                },

                data: dataArray,

                columns: [
                    { data: 'Domain' },
                    { data: 'Subdomain' },
                    { data: 'ProjectName' },
                    { data: 'BillingPeriod' },
                    { data: 'InvoiceNo' },
                    {
                        data: 'OrderCount'
                    },
                    {
                        data: 'TotalAmount',
                        title: 'Total Amount ($0.00)' // default header
                    },
                    { data: 'InvoiceGeneratedOn' }
                ],

                fnCreatedRow: function (nRow) {
                    $(nRow).children("td").css("text-align", "center");
                },

                drawCallback: function () {
                    var api = this.api();

                    // Calculate total
                    var total = api
                        .column(6, { page: 'current' }) // TotalAmount column index
                        .data()
                        .reduce(function (a, b) {
                            return (parseFloat(a) || 0) + (parseFloat(b) || 0);
                        }, 0);

                    // Update header text
                    $(api.column(6).header()).html(
                        'Total Amount ($' + total.toFixed(3) + ')'
                    );
                },

                initComplete: function () {
                    $('#load1').hide();
                },

                buttons: [
                    {
                        extend: 'excelHtml5',
                        title: 'All project Billing Report',
                        autoFilter: true,
                    }
                ]
            });
        },

        error: function () {
            $('#load1').hide();
            alert("Error loading data");
        }
    });

    return false;
}

function apbr_bindgrid() {
    var fromdate = document.getElementById("apbr_fromdate").value;
    var todate = document.getElementById("apbr_todate").value;

    $('#load1').show();

    $.ajax({
        url: "AllProjectBillingReport.aspx/GetAllProjectBilingReport",
        type: "POST",
        dataType: "json",
        data: "{FromDate:'" + fromdate + "',ToDate:'" + todate + "'}",
        contentType: "application/json; charset=utf-8",

        success: function (data) {

            if ($.fn.dataTable.isDataTable('#apbr_table')) {
                $('#apbr_table').DataTable().destroy();
            }

            var dataArray = JSON.parse(data.d);

            $('#apbr_table').DataTable({
                dom: 'Btp',
                scrollX: true,
                destroy: true,
                paging: false,
                autoWidth: true,
                select: true,
                fixedHeader: true,
                processing: true,
                aaSorting: [],

                select: {
                    style: 'single'
                },

                data: dataArray,

                columns: [
                    { data: 'Domain' },
                    { data: 'Subdomain' },
                    { data: 'ProjectName' },
                    { data: 'BillingPeriod' },
                    { data: 'InvoiceNo' },
                    {
                        data: 'OrderCount',
                        title: 'Order Count (0)'
                    },
                    {
                        data: 'TotalAmount',
                        title: 'Total Amount ($0.00)'
                    },
                    { data: 'InvoiceGeneratedOn' }
                ],

                fnCreatedRow: function (nRow) {
                    $(nRow).children("td").css("text-align", "center");
                },

                drawCallback: function () {
                    var api = this.api();

                    // ---- OrderCount Total ----
                    var orderTotal = api
                        .column(5, { page: 'current' })
                        .data()
                        .reduce(function (a, b) {
                            return (parseInt(a) || 0) + (parseInt(b) || 0);
                        }, 0);

                    // ---- TotalAmount Total ----
                    var amountTotal = api
                        .column(6, { page: 'current' })
                        .data()
                        .reduce(function (a, b) {
                            return (parseFloat(String(a).replace(/[$,]/g, '')) || 0) +
                                (parseFloat(String(b).replace(/[$,]/g, '')) || 0);
                        }, 0);

                    // ---- Update Headers ----
                    $(api.column(5).header()).html(
                        'Order Count (' + orderTotal + ')'
                    );

                    $(api.column(6).header()).html(
                        'Total Amount ($' + amountTotal.toFixed(2) + ')'
                    );
                },

                initComplete: function () {
                    $('#load1').hide();
                },

                buttons: [
                    {
                        extend: 'excelHtml5',
                        title: 'All project Billing Report',
                        autoFilter: true,
                    }
                ]
            });
        },

        error: function () {
            $('#load1').hide();
            alert("Error loading data");
        }
    });

    return false;
}

function cbdr_bindDDSummmarygrid() {
    $('#load1').show();
    var columns = [];
    var FromDate = document.getElementById("cbdr_fromdate").value;
    var ToDate = document.getElementById("cbdr_todate").value;
    $.ajax({
        url: "ClientBillingDeviationReport.aspx/GetDDSummary",
        type: "POST",
        dataType: "json",
        data: "{FromDate:'" + FromDate + "',ToDate:'" + ToDate + "'}",
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            var dataArray = JSON.parse(data.d);//
            $.each(dataArray[0], function (key, value) {

                var my_item = {};
                my_item.data = key;
                my_item.title = key;
                columns.push(my_item);
            });

            cbdr_ddsummary = $('#cbdr_ddsummary').DataTable({
                dom: 'Bftip',
                destroy: true,
                orderCellsTop: true,
                fixedColumns: {
                    leftColumns: 2,
                },
                fixedHeader: true,
                scrollCollapse: true,
                scrollX: true,
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
                fnCreatedRow: function (nRow, aData, iDataIndex) {
                    $(nRow).children("td").css("text-wrap", "nowrap");
                    $(nRow).children("td").css("text-align", "center");
                },
                columnDefs: [
                    { className: "dt-center", targets: "_all" } // Centers all columns
                ],


                initComplete: function () {
                    $('#load1').hide();

                },
                buttons: [
                    {
                        extend: 'excelHtml5', title: 'IPS DD - Summary', autoFilter: true,


                    },


                ],

            });
        },
        error: function (error) {
            alert('error; ' + eval(error));
            alert('error; ' + error.responseText);
        }
    });
    return false;
}

function cbdr_bindDDDetailsgrid() {
    $('#load1').show();
    var columns = [];
    var FromDate = document.getElementById("cbdr_fromdate").value;
    var ToDate = document.getElementById("cbdr_todate").value;
    $.ajax({
        url: "ClientBillingDeviationReport.aspx/GetDDDetails",
        type: "POST",
        dataType: "json",
        data: "{FromDate:'" + FromDate + "',ToDate:'" + ToDate + "'}",
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            var dataArray = JSON.parse(data.d);//
            $.each(dataArray[0], function (key, value) {

                var my_item = {};
                my_item.data = key;
                my_item.title = key;
                columns.push(my_item);
            });

            cbdr_dddetails = $('#cbdr_dddetails').DataTable({
                dom: 'Bftip',
                destroy: true,
                orderCellsTop: true,
                fixedColumns: {
                    leftColumns: 3,
                },
                fixedHeader: true,
                scrollCollapse: true,
                scrollX: true,
                "paging": true,
                pageLength: 10,
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
                fnCreatedRow: function (nRow, aData, iDataIndex) {
                    $(nRow).children("td").css("text-align", "center");
                },
                columnDefs: [
                    { className: "dt-center", targets: "_all" } // Centers all columns
                ],


                initComplete: function () {
                    $('#load1').hide();

                },
                buttons: [
                    {
                        extend: 'excelHtml5', title: 'IPS DD - Parameter wise', autoFilter: true,


                    },


                ],

            });
        },
        error: function (error) {
            alert('error; ' + eval(error));
            alert('error; ' + error.responseText);
        }
    });
    return false;
}

function cbdr_bindNonDDSummmarygrid() {
    $('#load1').show();
    var columns = [];
    var FromDate = document.getElementById("cbdr_fromdate").value;
    var ToDate = document.getElementById("cbdr_todate").value;
    $.ajax({
        url: "ClientBillingDeviationReport.aspx/GetNonDDSummary",
        type: "POST",
        dataType: "json",
        data: "{FromDate:'" + FromDate + "',ToDate:'" + ToDate + "'}",
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            var dataArray = JSON.parse(data.d);//
            $.each(dataArray[0], function (key, value) {

                var my_item = {};
                my_item.data = key;
                my_item.title = key;
                columns.push(my_item);
            });

            cbdr_nonddsummary = $('#cbdr_nonddsummary').DataTable({
                dom: 'Bftip',
                destroy: true,
                orderCellsTop: true,
                fixedColumns: {
                    leftColumns: 2,
                },
                fixedHeader: true,
                scrollCollapse: true,
                scrollX: true,
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
                fnCreatedRow: function (nRow, aData, iDataIndex) {
                    $(nRow).children("td").css("text-wrap", "nowrap");
                    $(nRow).children("td").css("text-align", "center");
                },
                columnDefs: [
                    { className: "dt-center", targets: "_all" } // Centers all columns
                ],


                initComplete: function () {
                    $('#load1').hide();

                },
                buttons: [
                    {
                        extend: 'excelHtml5', title: 'IPS - Non DD - Summary', autoFilter: true,


                    },


                ],

            });
        },
        error: function (error) {
            alert('error; ' + eval(error));
            alert('error; ' + error.responseText);
        }
    });
    return false;
}

function cbdr_bindNonDDDetailsgrid() {
    $('#load1').show();
    var columns = [];
    var FromDate = document.getElementById("cbdr_fromdate").value;
    var ToDate = document.getElementById("cbdr_todate").value;
    $.ajax({
        url: "ClientBillingDeviationReport.aspx/GetNonDDDetails",
        type: "POST",
        dataType: "json",
        data: "{FromDate:'" + FromDate + "',ToDate:'" + ToDate + "'}",
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            var dataArray = JSON.parse(data.d);//
            $.each(dataArray[0], function (key, value) {

                var my_item = {};
                my_item.data = key;
                my_item.title = key;
                columns.push(my_item);
            });

            cbdr_nondddetails = $('#cbdr_nondddetails').DataTable({
                dom: 'Bftip',
                destroy: true,
                orderCellsTop: true,
                fixedColumns: {
                    leftColumns: 2,
                },
                fixedHeader: true,
                scrollCollapse: true,
                scrollX: true,
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
                fnCreatedRow: function (nRow, aData, iDataIndex) {
                    $(nRow).children("td").css("text-wrap", "nowrap");
                    $(nRow).children("td").css("text-align", "center");
                },
                columnDefs: [
                    { className: "dt-center", targets: "_all" } // Centers all columns
                ],


                initComplete: function () {
                    $('#load1').hide();

                },
                buttons: [
                    {
                        extend: 'excelHtml5', title: 'IPS - Non DD- Parameter wise', autoFilter: true,


                    },


                ],

            });
        },
        error: function (error) {
            alert('error; ' + eval(error));
            alert('error; ' + error.responseText);
        }
    });
    return false;
}

function cbdr_bindCanopySummmarygrid() {
    $('#load1').show();
    var columns = [];
    var FromDate = document.getElementById("cbdr_fromdate").value;
    var ToDate = document.getElementById("cbdr_todate").value;
    $.ajax({
        url: "ClientBillingDeviationReport.aspx/GetCanopySummary",
        type: "POST",
        dataType: "json",
        data: "{FromDate:'" + FromDate + "',ToDate:'" + ToDate + "'}",
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            var dataArray = JSON.parse(data.d);//
            $.each(dataArray[0], function (key, value) {

                var my_item = {};
                my_item.data = key;
                my_item.title = key;
                columns.push(my_item);
            });

            cbdr_canopysummary = $('#cbdr_canopysummary').DataTable({
                dom: 'Bftip',
                destroy: true,
                orderCellsTop: true,
                fixedColumns: {
                    leftColumns: 2,
                },
                fixedHeader: true,
                scrollCollapse: true,
                scrollX: true,
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
                fnCreatedRow: function (nRow, aData, iDataIndex) {
                    $(nRow).children("td").css("text-wrap", "nowrap");
                    $(nRow).children("td").css("text-align", "center");
                },
                columnDefs: [
                    { className: "dt-center", targets: "_all" } // Centers all columns
                ],


                initComplete: function () {
                    $('#load1').hide();

                },
                buttons: [
                    {
                        extend: 'excelHtml5', title: 'Canopy Summary', autoFilter: true,


                    },


                ],

            });
        },
        error: function (error) {
            alert('error; ' + eval(error));
            alert('error; ' + error.responseText);
        }
    });
    return false;
}

function cbdr_bindCanopyDetailsgrid() {
    $('#load1').show();
    var columns = [];
    var FromDate = document.getElementById("cbdr_fromdate").value;
    var ToDate = document.getElementById("cbdr_todate").value;
    $.ajax({
        url: "ClientBillingDeviationReport.aspx/GetCanopyDetails",
        type: "POST",
        dataType: "json",
        data: "{FromDate:'" + FromDate + "',ToDate:'" + ToDate + "'}",
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            var dataArray = JSON.parse(data.d);//
            $.each(dataArray[0], function (key, value) {

                var my_item = {};
                my_item.data = key;
                my_item.title = key;
                columns.push(my_item);
            });

            cbdr_canopydetails = $('#cbdr_canopydetails').DataTable({
                dom: 'Bftip',
                destroy: true,
                orderCellsTop: true,
                fixedColumns: {
                    leftColumns: 2,
                },
                fixedHeader: true,
                scrollCollapse: true,
                scrollX: true,
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
                fnCreatedRow: function (nRow, aData, iDataIndex) {
                    $(nRow).children("td").css("text-wrap", "nowrap");
                    $(nRow).children("td").css("text-align", "center");
                },
                columnDefs: [
                    { className: "dt-center", targets: "_all" } // Centers all columns
                ],


                initComplete: function () {
                    $('#load1').hide();

                },
                buttons: [
                    {
                        extend: 'excelHtml5', title: 'Canopy - Parameter wise', autoFilter: true,


                    },


                ],

            });
        },
        error: function (error) {
            alert('error; ' + eval(error));
            alert('error; ' + error.responseText);
        }
    });
    return false;
}

function billingdifference_bindgrid() {
    var ddlmonth = document.getElementById("diff_month");
    var month = ddlmonth.options[ddlmonth.selectedIndex].value;
    var ddlyear = document.getElementById("diff_year");
    var year = ddlyear.options[ddlyear.selectedIndex].value;
    $('#load1').show();
    $.ajax({
        url: "BillingDifference.aspx/GetBillingDifference",
        type: "POST",
        dataType: "json",
        data: "{Month:'" + month + "',Year:'" + year + "'}",
        contentType: "application/json; charset=utf-8",

        success: function (data) {
            if ($.fn.dataTable.isDataTable('#diff_table')) {
                $('#diff_table').DataTable().destroy();
            }
            dataArray = JSON.parse(data.d);
            $('#diff_table').DataTable({
                dom: 'Btp',
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
                    { data: 'DomainName' },
                    { data: 'ProjectName' },
                    { data: 'BillingPeriod' },
                    { data: 'AutoCount' },
                    { data: 'ManualCount' },
                    { data: 'CountDifference' }
                ],
                fnCreatedRow: function (nRow, aData, iDataIndex) {
                    $(nRow).children("td").css("text-wrap", "nowrap");
                    $(nRow).children("td").css("text-align", "center");
                },
                columnDefs: [{ visible: false, targets: 0 }],
                drawCallback: function (settings) {
                    var api = this.api();
                    var rows = api.rows({ page: 'current' }).nodes();
                    var last = null;

                    var subTotal = new Array();
                    var groupID = -1;
                    var aData = new Array();
                    var index = 0;

                    api.column(0, { page: 'current' }).data().each(function (group, i) {

                        // console.log(group+">>>"+i);

                        var vals = api.row(api.row($(rows).eq(i)).index()).data();
                        var autocount = vals.AutoCount ? parseInt(vals.AutoCount) : 0;
                        var manualcount = vals.ManualCount ? parseInt(vals.ManualCount) : 0;
                        var diff = vals.CountDifference ? parseInt(vals.CountDifference) : 0;

                        if (typeof aData[group] == 'undefined') {
                            aData[group] = new Array();
                            aData[group].rows = [];
                            aData[group].autocount = [];
                            aData[group].manualcount = [];
                            aData[group].diff = [];
                        }

                        aData[group].rows.push(i);
                        aData[group].autocount.push(autocount);
                        aData[group].manualcount.push(manualcount);
                        aData[group].diff.push(diff);

                    });
                    var idx = 0;


                    for (var office in aData) {

                        idx = Math.max.apply(Math, aData[office].rows);

                        var sum = 0;
                        var summanual = 0;
                        var sumdiff = 0;
                        $.each(aData[office].autocount, function (k, v) {
                            sum = sum + v;
                        });
                        $.each(aData[office].manualcount, function (k, v) {
                            summanual = summanual + v;
                        });
                        $.each(aData[office].diff, function (k, v) {
                            sumdiff = sumdiff + v;
                        });
                        console.log(aData[office].autocount);
                        $(rows).eq(idx).after(
                            '<tr class="group" style="border-top:Solid 1px black;border-bottom:Solid 1px black; font-size:14px;"><td colspan="2" style="font-weight:bold;border-top:Solid 1px black;border-bottom:Solid 1px black;">' + office + '</td>' +
                            '<td style="text-align:center;font-weight:bold;border-top:Solid 1px black;border-bottom:Solid 1px black;">' + sum + '</td><td style="text-align:center;font-weight:bold;border-top:Solid 1px black;border-bottom:Solid 1px black;">' + summanual + '</td><td style="border-top:Solid 1px black;border-bottom:Solid 1px black;text-align:center;font-weight:bold;">' + sumdiff + '</td></tr>'
                        );

                    };
                },

                initComplete: function () {
                    $('#load1').hide();
                },
                buttons: [
                    {
                        extend: 'excelHtml5', title: 'Auto vs manual billing difference', autoFilter: true,
                    },
                ],

            });

        }
    });

    return false;
}


function cprr_bindUserGrid() {
    $('#load1').show();
    var columns = [];
    var ddlmonth = document.getElementById("cppr_month");
    var month = ddlmonth.options[ddlmonth.selectedIndex].value;
    var ddlyear = document.getElementById("cppr_year");
    var year = ddlyear.options[ddlyear.selectedIndex].value;
    $.ajax({
        url: "CostPerRecordReport.aspx/GetCostPerRecord_Userwise",
        type: "POST",
        dataType: "json",
        data: "{Month:'" + month + "',Year:'" + year + "'}",
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            var dataArray = JSON.parse(data.d);//
            $.each(dataArray[0], function (key, value) {

                var my_item = {};
                my_item.data = key;
                my_item.title = key;
                columns.push(my_item);
            });
            if ($.fn.dataTable.isDataTable('#cprr_userwise')) {
                $('#cprr_userwise').DataTable().destroy();
            }
            cprr_userwise = $('#cprr_userwise').DataTable({
                dom: 'Bftip',
                destroy: true,
                orderCellsTop: true,
                scrollX: true,
                "paging": true,
                pageLength: 10,
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
                fnCreatedRow: function (nRow, aData, iDataIndex) {
                    $(nRow).children("td").css("text-wrap", "nowrap");
                },
            
                initComplete: function () {
                    $('#load1').hide();

                },
                buttons: [
                    {
                        extend: 'excelHtml5', title: 'Userwise Cost Per Record', autoFilter: true,


                    },


                ],

            });
        },
        error: function (error) {
            alert('error; ' + eval(error));
            alert('error; ' + error.responseText);
        }
    });
    return false;
}

function cprr_bindDomainGrid() {
    $('#load1').show();
    var columns = [];
    var ddlmonth = document.getElementById("cppr_month");
    var month = ddlmonth.options[ddlmonth.selectedIndex].value;
    var ddlyear = document.getElementById("cppr_year");
    var year = ddlyear.options[ddlyear.selectedIndex].value;
    $.ajax({
        url: "CostPerRecordReport.aspx/GetCostPerRecord_Domain",
        type: "POST",
        dataType: "json",
        data: "{Month:'" + month + "',Year:'" + year + "'}",
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            var dataArray = JSON.parse(data.d);//
            $.each(dataArray[0], function (key, value) {
                var my_item = {};
                my_item.data = key;
                my_item.title = key;
                columns.push(my_item);
            });
            if ($.fn.dataTable.isDataTable('#cprr_domainwise')) {
                $('#cprr_domainwise').DataTable().destroy();
            }
            cprr_domainwise = $('#cprr_domainwise').DataTable({
                dom: 'Bftip',
                destroy: true,
                scrollX: true,
                "paging": true,
                pageLength: 10,
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

                fnCreatedRow: function (nRow, aData, iDataIndex) {
                },
               
                initComplete: function () {
                    $('#load1').hide();

                },
                buttons: [
                    {
                        extend: 'excelHtml5', title: 'Domainwise Cost Per Record', autoFilter: true,
                    },


                ],

            });
        },
        error: function (error) {
            alert('error; ' + eval(error));
            alert('error; ' + error.responseText);
        }
    });
    return false;
}

function cprr_bindProjectGrid() {
    $('#load1').show();
    var columns = [];
    var ddlmonth = document.getElementById("cppr_month");
    var month = ddlmonth.options[ddlmonth.selectedIndex].value;
    var ddlyear = document.getElementById("cppr_year");
    var year = ddlyear.options[ddlyear.selectedIndex].value;
    $.ajax({
        url: "CostPerRecordReport.aspx/GetCostPerRecord_Project",
        type: "POST",
        dataType: "json",
        data: "{Month:'" + month + "',Year:'" + year + "'}",
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            var dataArray = JSON.parse(data.d);//
            $.each(dataArray[0], function (key, value) {

                var my_item = {};
                my_item.data = key;
                my_item.title = key;
                columns.push(my_item);
            });
            if ($.fn.dataTable.isDataTable('#cprr_projectwise')) {
                $('#cprr_projectwise').DataTable().destroy();
            }
            cprr_projectwise = $('#cprr_projectwise').DataTable({
                dom: 'Bftip',
                destroy: true,
                scrollX: true,
                "paging": true,
                pageLength: 10,
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
                fnCreatedRow: function (nRow, aData, iDataIndex) {
                },
               
                initComplete: function () {
                    $('#load1').hide();

                },
                buttons: [
                    {
                        extend: 'excelHtml5', title: 'Projectwise Cost Per Record', autoFilter: true,


                    },


                ],

            });
        },
        error: function (error) {
            alert('error; ' + eval(error));
            alert('error; ' + error.responseText);
        }
    });
    return false;
}



//DASHBOARD

function dashboard_arBind_displayERP_OLD() {
    $('#load1').show();
    var columns = [];
    var columnlink = [];
    var preheader = '';
    var headers = [];
    var returnstring = '';
    var htmlheader = '';
    var htmlrow = '';
    $.ajax({
        url: "Dashboard.aspx/GetClientwiseDashboard_ERpData",
        type: "POST",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            var dataArray = JSON.parse(data.d);//
            var firstData = dataArray[0];
            var rowData = dataArray[1];
            var ColumnNames = Object.keys(firstData);
            var rowValues = Object.keys(rowData);

            htmlheader = '<thead><tr>';
            var thead = document.createElement("thead");
            var trh = document.createElement("tr");
            for (var i = 1; i < ColumnNames.length; i++) {
                if (i == 2 || i == 3) {
                    var tbh = document.createElement("th");
                    tbh.rowSpan = 2;
                    tbh.style.fontWeight = "bold!important";
                    tbh.style.verticalAlign = "middle";
                    tbh.id = i + "_ClientLabel";
                    tbh.style.left = "0px!important";
                    //tbh.appendChild(label);
                    tbh.innerHTML = ColumnNames[i];
                    trh.appendChild(tbh);

                    //thead.appendChild(trh);
                    //htmlheader = htmlheader + '<th style="left: 0px!important;">Client</th>';
                }
                else if (i > 1) {
                    if (i % 2 == 0) {
                        var tbh = document.createElement("th");
                        tbh.colSpan = 2;
                        tbh.style.textAlign = "center";
                        tbh.innerHTML = ColumnNames[i].replace("-ERP-LoanCount", "").replace("-ERP-Amount", "");
                        trh.appendChild(tbh);
                        //thead.appendChild(trh);
                        //htmlheader = htmlheader + '<th colspan=2 style="padding-left:20px;left: 0px!important; text-align:center;">' + ColumnNames[i].replace("-LoanCount", "").replace("-Amount", "") + '</th>';
                        i = i + 1;
                    }
                    //else
                    //    htmlheader = htmlheader + '<th style="padding-left:20px;left: 0px!important; text-align:center;">' + ColumnNames[i] + '</th>';
                }
                else {
                    var tbh = document.createElement("th");
                    //tbh.style.display = 'none';
                    tbh.innerHTML = ColumnNames[i];
                    //htmlheader = htmlheader + '<th style="display:none;">' + ColumnNames[i] + '</th>';
                    trh.appendChild(tbh);
                    //thead.appendChild(trh);
                }
            }
            thead.appendChild(trh);
            $('#dashboard_ar').append(thead);
            var trh1 = document.createElement("tr");
            //htmlheader = htmlheader + '</tr><tr>';
            for (var i = 1; i < ColumnNames.length; i++) {
                if (i == 2 || i == 3) {
                    //var tbr = document.createElement("th");
                    //tbr.innerHTML = ColumnNames[i];
                    //tbr.style.textAlign = "center";
                    //trh1.appendChild(tbr);
                    ////htmlheader = htmlheader + '<th style="left: 0px!important; ">' + ColumnNames[i] + '</th>';
                }
                else if (i > 1)
                    if (i % 2 != 0) {
                        var tbr = document.createElement("th");
                        tbr.style.textAlign = "center";
                        tbr.style.verticalAlign = "middle";
                        tbr.innerHTML = 'US $';
                        tbr.id = "lbl_" + (i - 1);
                        trh1.appendChild(tbr);
                    }
                    else {
                        var tbr = document.createElement("th");
                        tbr.style.textAlign = "center";
                        tbr.style.verticalAlign = "middle";
                        tbr.innerHTML = 'Count';
                        tbr.id = "lbl_" + (i - 1);
                        trh1.appendChild(tbr);
                    }
                else {
                    var tbr = document.createElement("th");
                    //tbr.style.display = 'none';
                    tbr.innerHTML = ColumnNames[i];

                    //htmlheader = htmlheader + '<th style="display:none;">' + ColumnNames[i] + '</th>';
                    trh1.appendChild(tbr);
                }
            }
            thead.appendChild(trh1);
            $('#dashboard_ar').append(thead);
            var tbody = document.createElement("tbody");
            //$('#dashboard_ar').html("");
            //htmlheader = htmlheader + '</tr></thead>';
            //htmlrow = '<tbody>';
            $.each(dataArray, function (index, item) {
                var tr1 = document.createElement("tr");
                //htmlrow = htmlrow + '<tr>';
                for (var i = 1; i < ColumnNames.length; i++) {
                    var targetColumnName = ColumnNames[i];
                    if (i == 2 || i == 3) {
                        var td = document.createElement("td");
                        var label = document.createElement("label");
                        label.id = i + "_" + item[targetColumnName].replace(" ", "") + "ClientLabel";
                        label.innerHTML = item[targetColumnName];
                        if (ColumnNames[i] == "Process")
                            label.style.width = "180px";
                        else
                            label.style.width = "250px";
                        /*label.style.width = "250px";*/
                        td.appendChild(label);
                        tr1.appendChild(td);
                    }
                    else if (i > 1) {
                        //if (i % 2 == 0) {
                        var td = document.createElement("td");
                        td.style.textAlign = "center";
                        //if (targetColumnName].includes("Amount")) {
                        //    td.innerHTML = "" + formattedAmount.toLocaleString("en-US", { style: "currency", currency: "USD" });
                        //}
                        //else
                        if (item[targetColumnName] != null)
                            td.innerHTML = new Intl.NumberFormat().format(Number(item[targetColumnName]))
                        else
                            td.innerHTML = item[targetColumnName];
                        //td.innerHTML = '<input type="text" id="loancount_' + targetColumnName + '_' + index + '" onchange="return getValue(this,' + index + ');" style="width:70px;" value="' + blankForNull(item[targetColumnName]) + '"></input>';
                        tr1.appendChild(td);
                        //}
                        //else {
                        //    var td = document.createElement("td");
                        //    td.style.textAlign = "center";
                        //    td.innerHTML = '<input type="text" id="loancount_' + targetColumnName + '_' + index + '" onchange="return getValue(this,' + index + ');" style="width:50px;" value="' + blankForNull(item[targetColumnName]) + '"></input>';
                        //    tr1.appendChild(td);
                        //}
                    }
                    else {
                        var td = document.createElement("td");
                        //td.style.display = 'none';
                        td.innerHTML = item[targetColumnName];
                        tr1.appendChild(td);
                    }
                }
                tbody.appendChild(tr1);
                $('#dashboard_ar').append(tbody);
            });


            //Footer
            var tfoot = document.createElement("tfoot");
            var trf1 = document.createElement("tr");
            for (var i = 1; i < ColumnNames.length; i++) {
                if (i == 2 || i == 3) {
                    var tbr = document.createElement("th");
                    tbr.style.textAlign = "center";
                    trf1.appendChild(tbr);
                }
                else if (i > 1) {
                    var tbr = document.createElement("th");
                    tbr.style.textAlign = "center";
                    trf1.appendChild(tbr);
                }
                else {
                    var tbr = document.createElement("th");
                    // tbr.style.display = 'none';
                    trf1.appendChild(tbr);
                }
            }
            tfoot.appendChild(trf1);
            $('#dashboard_ar').append(tfoot);

            $('#dashboard_ar').DataTable({
                dom: 'Bft',
                //destroy: true,
                orderCellsTop: true,
                fixedColumns: {
                    leftColumns: 2,
                },
                scrollCollapse: false,
                scrollY: '400px',
                scrollX: true,
                "paging": false,
                "autoWidth": true,
                select: true,
                "ordering": false,
                filter: true,
                'select': {
                    'style': 'single'
                },
                "serverSide": false,

                initComplete: function () {
                    $('#load1').hide();
                },
                columnDefs: [
                    { targets: 0, visible: false }  // hides column index 2
                ],
                buttons: [
                    {
                        extend: 'excelHtml5',
                        text: 'Export to Excel',
                        filename: 'Monthwise Summary',
                        exportOptions: {
                            columns: ':visible',
                            modifier: { header: false }
                        },
                        customize: function (xlsx) {
                            const sheetDoc = xlsx.xl.worksheets['sheet1.xml'];
                            const worksheet = sheetDoc.documentElement;
                            const sheetData = worksheet.getElementsByTagName('sheetData')[0];
                            const $worksheet = $(worksheet);


                            // Remove all existing rows (clean slate)
                            $worksheet.find('row').remove();

                            // Remove existing mergeCells if any
                            $worksheet.find('mergeCells').remove();

                            function colLetter(n) {
                                let s = '', t;
                                while (n > 0) {
                                    t = (n - 1) % 26;
                                    s = String.fromCharCode(65 + t) + s;
                                    n = Math.floor((n - 1) / 26);
                                }
                                return s;
                            }

                            const occupied = {};
                            const mergeRanges = [];

                            const stylesDoc = xlsx.xl['styles.xml'];
                            const fonts = stylesDoc.getElementsByTagName('fonts')[0];
                            const borders = stylesDoc.getElementsByTagName('borders')[0];
                            const cellXfs = stylesDoc.getElementsByTagName('cellXfs')[0];

                            // --- Create bold font for header
                            const headerFont = stylesDoc.createElement('font');
                            const bold = stylesDoc.createElement('b');
                            const color = stylesDoc.createElement('color');
                            color.setAttribute('rgb', 'FF000000'); // black
                            headerFont.appendChild(bold);
                            headerFont.appendChild(color);
                            fonts.appendChild(headerFont);
                            const headerFontId = fonts.childNodes.length - 1;
                            fonts.setAttribute('count', fonts.childNodes.length.toString());

                            // --- Create border for all cells
                            const border = stylesDoc.createElement('border');
                            ['left', 'right', 'top', 'bottom'].forEach(side => {
                                const sideElem = stylesDoc.createElement(side);
                                sideElem.setAttribute('style', 'thin');
                                const colorElem = stylesDoc.createElement('color');
                                colorElem.setAttribute('auto', '1');
                                sideElem.appendChild(colorElem);
                                border.appendChild(sideElem);
                            });

                            const headerStyle = stylesDoc.createElement('xf');
                            headerStyle.setAttribute('numFmtId', '0');
                            headerStyle.setAttribute('fontId', headerFontId.toString());
                            headerStyle.setAttribute('fillId', '0');
                            headerStyle.setAttribute('xfId', '0');
                            headerStyle.setAttribute('applyFont', '1');
                            headerStyle.setAttribute('applyBorder', '1');
                            headerStyle.setAttribute('applyAlignment', '1');

                            // Add alignment child
                            const alignment = stylesDoc.createElement('alignment');
                            alignment.setAttribute('horizontal', 'center');
                            alignment.setAttribute('vertical', 'center');
                            alignment.setAttribute('wrapText', '1');
                            headerStyle.appendChild(alignment);

                            cellXfs.appendChild(headerStyle);

                            // Append the new xf
                            //cellXfs.appendChild(headerAlignXf);
                            const headerStyleIndex = cellXfs.childNodes.length - 1;
                            cellXfs.setAttribute('count', cellXfs.childNodes.length.toString());
                            // Start rowIndex at 1 to insert headers at the top
                            let rowIndex = 1;

                            // 1. Add header rows from thead
                            $('#dashboard_ar thead tr').each(function () {
                                let colIndex = 1;
                                const trElm = sheetDoc.createElement('row');
                                trElm.setAttribute('r', rowIndex);

                                $(this).children('th, td').each(function () {
                                    const $cell = $(this);
                                    const colspan = parseInt($cell.attr('colspan')) || 1;
                                    const rowspan = parseInt($cell.attr('rowspan')) || 1;

                                    while (occupied[rowIndex + '-' + colIndex]) {
                                        colIndex++;
                                    }

                                    const startCol = colIndex;
                                    const endCol = colIndex + colspan - 1;
                                    const endRow = rowIndex + rowspan - 1;

                                    const cellRef = colLetter(startCol) + rowIndex;
                                    const c = sheetDoc.createElement('c');
                                    c.setAttribute('r', cellRef);
                                    c.setAttribute('t', 'str');
                                    c.setAttribute('s', headerStyleIndex.toString());

                                    const v = sheetDoc.createElement('v');
                                    let cellText = $cell.text().trim().replace(/\s+/g, ' ');
                                    if (!cellText) cellText = ' ';
                                    v.textContent = cellText;
                                    c.appendChild(v);
                                    trElm.appendChild(c);

                                    for (let rr = rowIndex; rr <= endRow; rr++) {
                                        for (let cc = startCol; cc <= endCol; cc++) {
                                            occupied[rr + '-' + cc] = true;
                                        }
                                    }

                                    if (colspan > 1 || rowspan > 1) {
                                        mergeRanges.push(colLetter(startCol) + rowIndex + ':' + colLetter(endCol) + endRow);
                                    }

                                    colIndex += colspan;
                                });

                                sheetData.appendChild(trElm);
                                rowIndex++;
                            });

                            const dataStyle = stylesDoc.createElement('xf');
                            dataStyle.setAttribute('numFmtId', '0');
                            dataStyle.setAttribute('fontId', '0'); // default font
                            dataStyle.setAttribute('fillId', '0');
                            dataStyle.setAttribute('xfId', '0');
                            dataStyle.setAttribute('applyAlignment', '1');

                            const dataAlignment = stylesDoc.createElement('alignment');
                            dataAlignment.setAttribute('horizontal', 'center');
                            dataAlignment.setAttribute('vertical', 'center');
                            dataAlignment.setAttribute('wrapText', '1');
                            dataStyle.appendChild(dataAlignment);

                            cellXfs.appendChild(dataStyle);
                            const centerStyleIndex = cellXfs.childNodes.length - 1;
                            cellXfs.setAttribute('count', cellXfs.childNodes.length.toString());

                            // 2. Add data rows from tbody
                            $('#dashboard_ar tbody tr').each(function () {
                                let colIndex = 1;
                                const trElm = sheetDoc.createElement('row');
                                trElm.setAttribute('r', rowIndex);

                                $(this).children('td').each(function () {
                                    const $cell = $(this);
                                    const colspan = parseInt($cell.attr('colspan')) || 1;
                                    const rowspan = parseInt($cell.attr('rowspan')) || 1;

                                    while (occupied[rowIndex + '-' + colIndex]) {
                                        colIndex++;
                                    }

                                    const startCol = colIndex;
                                    const endCol = colIndex + colspan - 1;
                                    const endRow = rowIndex + rowspan - 1;

                                    const cellRef = colLetter(startCol) + rowIndex;
                                    const c = sheetDoc.createElement('c');
                                    c.setAttribute('r', cellRef);
                                    c.setAttribute('t', 'str');
                                    if (colIndex > 2)
                                        c.setAttribute('s', centerStyleIndex.toString());

                                    const v = sheetDoc.createElement('v');
                                    let cellText = $cell.text().trim().replace(/\s+/g, ' ');
                                    if (!cellText) cellText = ' ';
                                    v.textContent = cellText;
                                    c.appendChild(v);
                                    trElm.appendChild(c);

                                    for (let rr = rowIndex; rr <= endRow; rr++) {
                                        for (let cc = startCol; cc <= endCol; cc++) {
                                            occupied[rr + '-' + cc] = true;
                                        }
                                    }

                                    if (colspan > 1 || rowspan > 1) {
                                        mergeRanges.push(colLetter(startCol) + rowIndex + ':' + colLetter(endCol) + endRow);
                                    }

                                    colIndex += colspan;
                                });

                                sheetData.appendChild(trElm);
                                rowIndex++;
                            });

                            // Add mergeCells element if any merges needed
                            if (mergeRanges.length > 0) {
                                const mergeCells = sheetDoc.createElement('mergeCells');
                                mergeCells.setAttribute('count', mergeRanges.length);

                                mergeRanges.forEach(range => {
                                    const mergeCell = sheetDoc.createElement('mergeCell');
                                    mergeCell.setAttribute('ref', range);
                                    mergeCells.appendChild(mergeCell);
                                });

                                if (sheetData.nextSibling) {
                                    worksheet.insertBefore(mergeCells, sheetData.nextSibling);
                                } else {
                                    worksheet.appendChild(mergeCells);
                                }
                            }
                        }




                    },
                ],
                footerCallback: function (row, data, start, end, display) {
                    let api = this.api();

                    // Remove the formatting to get integer data for summation
                    let intVal = function (i) {
                        return typeof i === 'string' ? i.replace(/[\$,]/g, '') * 1 : typeof i === 'number' ? i : 0;
                    };
                    for (var i = 3; i < api.columns().count(); i++) {

                        var totalLoan = api.column(i, { page: 'current' }).data().reduce((a, b) => intVal(a) + intVal(b), 0);
                        var totalAmt = api.column(i, { page: 'current' }).data().reduce((a, b) => intVal(a) + intVal(b), 0);

                        api.column(i).footer().innerHTML = Number(totalLoan).toFixed(2);
                        api.column(i).footer().innerHTML = Number(totalAmt).toFixed(2);

                        if (i % 2 != 0)
                            document.getElementById("lbl_" + (i)).innerHTML = "Count (" + new Intl.NumberFormat().format(Number(totalLoan)) + ")";
                        else
                            document.getElementById("lbl_" + (i)).innerHTML = "US $ (" + new Intl.NumberFormat().format(Number(totalAmt).toFixed(2)) + ")";

                        //document.getElementById("lbl_" + (i)).innerHTML = "(" + Number(totalLoan).toFixed(2) + ")";
                        //document.getElementById("lbl_" + (i)).innerHTML = "(" + Number(totalAmt).toFixed(2) + ")";


                    }
                }


            });

        },
        error: function (error) {
            alert('error; ' + eval(error));
            alert('error; ' + error.responseText);
        }
    });
    return false;
}


function dashboard_arBind_displayERP_Test1() {

    $('#load1').show();

    const table = $('#dashboard_ar');
    table.empty();

    $.ajax({
        url: "Dashboard.aspx/GetClientwiseDashboard_ERpData",
        type: "POST",
        dataType: "json",
        contentType: "application/json; charset=utf-8",

        success: function (data) {

            const dataArray = JSON.parse(data.d);

            if (!dataArray || dataArray.length === 0) {
                $('#load1').hide();
                return;
            }

            const rawColumns = Object.keys(dataArray[0]);

            // ================= CLEAN COLUMNS =================
            const columns = rawColumns.filter(c =>
                c !== "ProjectId" &&
                c !== "ResultID"
            );

            // Pair detection (Month columns)
            const fixedCols = 2;

            // ================= HEADER =================
            const thead = $('<thead/>');
            const row1 = $('<tr/>');
            const row2 = $('<tr/>');

            for (let i = 0; i < columns.length; i++) {

                const col = columns[i];

                // FIXED COLUMNS
                if (i < fixedCols) {
                    row1.append(`<th rowspan="2" style="vertical-align:middle;">${col}</th>`);
                    continue;
                }

                // GROUP HEADER (Month)
                if ((i - fixedCols) % 2 === 0) {

                    const monthName = col
                        .replace("-Count", "")
                        .replace("-Amount", "");

                    row1.append(`
                        <th colspan="2" style="text-align:center;">
                            ${monthName}
                        </th>
                    `);
                }

                // SUB HEADER
                if ((i - fixedCols) % 2 === 0) {
                    row2.append(`<th style="text-align:center;">Count</th>`);
                } else {
                    row2.append(`<th style="text-align:center;">US $</th>`);
                }
            }

            thead.append(row1).append(row2);
            table.append(thead);

            // ================= BODY =================
            const tbody = $('<tbody/>');

            dataArray.forEach(item => {

                const tr = $('<tr/>');

                columns.forEach((col, i) => {

                    let value = item[col];

                    // FIX NaN / NULL
                    if (value === null || value === undefined || value === "") {
                        value = 0;
                    }

                    // FIRST 2 COLUMNS (FIXED TEXT)
                    if (i < fixedCols) {
                        tr.append(`<td>${value}</td>`);
                    }
                    else {
                        tr.append(`
                            <td style="text-align:center;">
                                ${new Intl.NumberFormat().format(Number(value))}
                            </td>
                        `);
                    }
                });

                tbody.append(tr);
            });

            table.append(tbody);

            // ================= FOOTER =================
            const tfoot = $('<tfoot/>');
            const footerRow = $('<tr/>');

            columns.forEach(() => {
                footerRow.append(`<th></th>`);
            });

            tfoot.append(footerRow);
            table.append(tfoot);

            // ================= DATATABLE =================
            table.DataTable({
                destroy: true,

                dom: 'Bft',

                scrollX: true,
                scrollY: '400px',
                scrollCollapse: true,

                paging: false,
                ordering: false,

                autoWidth: false,   // 🔥 CRITICAL FIX

                fixedColumns: {
                    leftColumns: 2   // ✅ FREEZE Project + Client
                },

                buttons: ['excelHtml5'],

                initComplete: function () {
                    $('#load1').hide();
                },

                footerCallback: function () {

                    const api = this.api();

                    const intVal = (i) =>
                        typeof i === 'string'
                            ? i.replace(/[\$,]/g, '') * 1
                            : typeof i === 'number'
                                ? i
                                : 0;

                    for (let i = fixedCols; i < api.columns().count(); i++) {

                        const total = api.column(i).data()
                            .reduce((a, b) => intVal(a) + intVal(b), 0);

                        $(api.column(i).footer()).html(
                            new Intl.NumberFormat().format(total)
                        );
                    }
                }
            });

        },

        error: function (err) {
            $('#load1').hide();
            console.error(err);
            alert("Error loading dashboard");
        }
    });

    return false;
}

function dashboard_arBind_displayERP_Live() {

    $('#load1').show();

    const table = $('#dashboard_ar');
    table.empty();

    $.ajax({
        url: "Dashboard.aspx/GetClientwiseDashboard_ERpData",
        type: "POST",
        dataType: "json",
        contentType: "application/json; charset=utf-8",

        success: function (data) {

            const dataArray = JSON.parse(data.d);

            if (!dataArray || dataArray.length === 0) {
                $('#load1').hide();
                return;
            }

            // ================= CLEAN COLUMNS =================
            const columns = Object.keys(dataArray[0])
                .filter(c =>
                    c !== "ProjectId" &&
                    c !== "ResultID"
                );

            const fixedCols = 2;

            // ================= MONTH NAME CLEANER =================
            //function getMonthName(col) {
            //    return col
            //        .replace("-LoanCount", "")
            //        .replace("-Amount", "")
            //        .replace("-ERP-LoanCount", "")
            //        .replace("-ERP-Amount", "");
            //}

            function getMonthName(col) {
                return col
                    .replace(/-ERP-/g, "-")
                    .replace("-LoanCount", "")
                    .replace("-Amount", "")
                    .replace(/-+/g, "-")
                    .replace(/-$/, "");
            }

            // ================= HEADER =================
            const thead = $('<thead/>');
            const row1 = $('<tr/>');
            const row2 = $('<tr/>');

            for (let i = 0; i < columns.length; i++) {

                const col = columns[i];

                // FIXED COLUMNS
                if (i < fixedCols) {
                    row1.append(`
                        <th rowspan="2" style="vertical-align:middle;">
                            ${col}
                        </th>
                    `);
                    continue;
                }

                // GROUP HEADER (MONTH ONLY)
                if ((i - fixedCols) % 2 === 0) {

                    const month = getMonthName(col);

                    row1.append(`
                        <th colspan="2" style="text-align:center;">
                            ${month}
                        </th>
                    `);
                }

                // SUB HEADER
                if ((i - fixedCols) % 2 === 0) {
                    row2.append(`<th style="text-align:center;">Count</th>`);
                } else {
                    row2.append(`<th style="text-align:center;">US $</th>`);
                }
            }

            thead.append(row1).append(row2);
            table.append(thead);

            // ================= BODY =================
            const tbody = $('<tbody/>');

            dataArray.forEach(item => {

                const tr = $('<tr/>');

                columns.forEach((col, i) => {

                    let value = item[col];

                    // FIX NaN / NULL
                    if (value === null || value === undefined || value === "") {
                        value = 0;
                    }

                    // FIXED COLUMNS (TEXT)
                    if (i < fixedCols) {
                        tr.append(`<td>${value}</td>`);
                    }
                    else {
                        tr.append(`
                            <td style="text-align:center;">
                                ${new Intl.NumberFormat().format(Number(value))}
                            </td>
                        `);
                    }
                });

                tbody.append(tr);
            });

            table.append(tbody);

            // ================= FOOTER =================
            const tfoot = $('<tfoot/>');
            const footerRow = $('<tr/>');

            columns.forEach(() => {
                footerRow.append(`<th></th>`);
            });

            tfoot.append(footerRow);
            table.append(tfoot);

            // ================= DATATABLE =================
            table.DataTable({
                destroy: true,

                dom: 'Bft',

                scrollX: true,
                scrollY: '400px',
                scrollCollapse: true,

                paging: false,
                ordering: false,

                autoWidth: false,

                fixedColumns: {
                    leftColumns: 3   // ✅ FREEZE Project + Client
                },

                buttons: ['excelHtml5'],

                initComplete: function () {
                    $('#load1').hide();
                },

                footerCallback: function () {

                    const api = this.api();

                    const intVal = (i) =>
                        typeof i === 'string'
                            ? i.replace(/[\$,]/g, '') * 1
                            : typeof i === 'number'
                                ? i
                                : 0;

                    for (let i = fixedCols; i < api.columns().count(); i++) {

                        const total = api.column(i).data()
                            .reduce((a, b) => intVal(a) + intVal(b), 0);

                        $(api.column(i).footer()).html(
                            new Intl.NumberFormat().format(total)
                        );
                    }
                }
            });

        },

        error: function (err) {
            $('#load1').hide();
            console.error(err);
            alert("Error loading dashboard");
        }
    });

    return false;
}

function dashboard_arBind_displayERP_Working() {

    $('#load1').show();

    const table = $('#dashboard_ar');
    table.empty();

    $.ajax({
        url: "Dashboard.aspx/GetClientwiseDashboard_ERpData",
        type: "POST",
        dataType: "json",
        contentType: "application/json; charset=utf-8",

        success: function (data) {

            const dataArray = JSON.parse(data.d);

            if (!dataArray || dataArray.length === 0) {
                $('#load1').hide();
                return;
            }

            // ================= COLUMNS =================
            const columns = Object.keys(dataArray[0])
                .filter(c => c !== "ProjectId" && c !== "ResultID");

            // ✅ NOW 3 FIXED COLUMNS
            const fixedCols = 3;

            // ================= MONTH NAME CLEANER =================
            function getMonthName(col) {
                return col
                    .replace(/-ERP-/g, "-")
                    .replace("-LoanCount", "")
                    .replace("-Amount", "")
                    .replace(/-+/g, "-")
                    .replace(/-$/, "");
            }

            // ================= HEADER =================
            const thead = $('<thead/>');
            const row1 = $('<tr/>');
            const row2 = $('<tr/>');

            for (let i = 0; i < columns.length; i++) {

                const col = columns[i];

                // ✅ FIXED COLUMNS (Project, Client, Process)
                if (i < fixedCols) {
                    row1.append(`
                        <th rowspan="2" style="vertical-align:middle;">
                            ${col}
                        </th>
                    `);
                    continue;
                }

                // ✅ MONTH GROUP HEADER
                if ((i - fixedCols) % 2 === 0) {
                    const month = getMonthName(col);

                    row1.append(`
                        <th colspan="2" style="text-align:center;">
                            ${month}
                        </th>
                    `);
                }

                // ✅ SUB HEADERS
                if ((i - fixedCols) % 2 === 0) {
                    row2.append(`<th style="text-align:center;">Count</th>`);
                } else {
                    row2.append(`<th style="text-align:center;">US $</th>`);
                }
            }

            thead.append(row1).append(row2);
            table.append(thead);

            // ================= BODY =================
            const tbody = $('<tbody/>');

            dataArray.forEach(item => {

                const tr = $('<tr/>');

                columns.forEach((col, i) => {

                    let value = item[col];

                    if (value === null || value === undefined || value === "") {
                        value = 0;
                    }

                    // ✅ TEXT COLUMNS
                    if (i < fixedCols) {
                        tr.append(`<td>${value}</td>`);
                    }
                    else {
                        tr.append(`
                            <td style="text-align:center;">
                                ${new Intl.NumberFormat().format(Number(value))}
                            </td>
                        `);
                    }
                });

                tbody.append(tr);
            });

            table.append(tbody);

            // ================= FOOTER =================
            const tfoot = $('<tfoot/>');
            const footerRow = $('<tr/>');

            columns.forEach(() => {
                footerRow.append(`<th></th>`);
            });

            tfoot.append(footerRow);
            table.append(tfoot);

            // ================= DATATABLE =================
            table.DataTable({
                destroy: true,
                dom: 'Bft',

                scrollX: true,
                scrollY: '400px',
                scrollCollapse: true,

                paging: false,
                ordering: false,
                autoWidth: false,

                // ✅ FREEZE 3 COLUMNS
                fixedColumns: {
                    leftColumns: 3
                },

                buttons: ['excelHtml5'],

                initComplete: function () {
                    $('#load1').hide();
                },

                footerCallback: function () {

                    const api = this.api();

                    const intVal = (i) =>
                        typeof i === 'string'
                            ? i.replace(/[\$,]/g, '') * 1
                            : typeof i === 'number'
                                ? i
                                : 0;

                    for (let i = fixedCols; i < api.columns().count(); i++) {

                        const total = api.column(i).data()
                            .reduce((a, b) => intVal(a) + intVal(b), 0);

                        $(api.column(i).footer()).html(
                            new Intl.NumberFormat().format(total)
                        );
                    }
                }
            });

        },

        error: function (err) {
            $('#load1').hide();
            console.error(err);
            alert("Error loading dashboard");
        }
    });

    return false;
}

function dashboard_arBind_displayERP_Final() {

    $('#load1').show();

    const table = $('#dashboard_ar');
    table.empty();

    $.ajax({
        url: "Dashboard.aspx/GetClientwiseDashboard_ERpData",
        type: "POST",
        dataType: "json",
        contentType: "application/json; charset=utf-8",

        success: function (data) {

            const dataArray = JSON.parse(data.d);

            if (!dataArray || dataArray.length === 0) {
                $('#load1').hide();
                return;
            }

            // ================= COLUMNS =================
            const columns = Object.keys(dataArray[0])
                .filter(c => c !== "ProjectId" && c !== "ResultID");

            const fixedCols = 3;

            // ================= MONTH CLEANER =================
            function getMonthName(col) {
                return col
                    .replace(/-ERP-/g, "-")
                    .replace("-LoanCount", "")
                    .replace("-Amount", "")
                    .replace(/-+/g, "-")
                    .replace(/-$/, "");
            }

            // ================= EXPORT HEADERS (IMPORTANT FIX) =================
            const exportHeaders = [];

            columns.forEach((col, i) => {

                if (i < fixedCols) {
                    exportHeaders.push(col);
                } else {
                    const month = getMonthName(col);
                    const sub = (i - fixedCols) % 2 === 0 ? "Count" : "US $";
                    exportHeaders.push(`${month} - ${sub}`);
                }
            });

            // ================= HEADER =================
            const thead = $('<thead/>');
            const row1 = $('<tr/>');
            const row2 = $('<tr/>');

            for (let i = 0; i < columns.length; i++) {

                const col = columns[i];

                if (i < fixedCols) {
                    row1.append(`
                        <th rowspan="2" style="vertical-align:middle;">
                            ${col}
                        </th>
                    `);
                    continue;
                }

                if ((i - fixedCols) % 2 === 0) {
                    const month = getMonthName(col);

                    row1.append(`
                        <th colspan="2" style="text-align:center;">
                            ${month}
                        </th>
                    `);
                }

                if ((i - fixedCols) % 2 === 0) {
                    row2.append(`<th style="text-align:center;">Count</th>`);
                } else {
                    row2.append(`<th style="text-align:center;">US $</th>`);
                }
            }

            thead.append(row1).append(row2);
            table.append(thead);

            // ================= BODY =================
            const tbody = $('<tbody/>');

            dataArray.forEach(item => {

                const tr = $('<tr/>');

                columns.forEach((col, i) => {

                    let value = item[col];

                    if (value === null || value === undefined || value === "") {
                        value = 0;
                    }

                    if (i < fixedCols) {
                        tr.append(`<td>${value}</td>`);
                    } else {
                        tr.append(`
                            <td style="text-align:center;">
                                ${new Intl.NumberFormat().format(Number(value))}
                            </td>
                        `);
                    }
                });

                tbody.append(tr);
            });

            table.append(tbody);

            // ================= FOOTER =================
            const tfoot = $('<tfoot/>');
            const footerRow = $('<tr/>');

            columns.forEach(() => {
                footerRow.append(`<th></th>`);
            });

            tfoot.append(footerRow);
            table.append(tfoot);

            // ================= DATATABLE =================
            table.DataTable({
                destroy: true,
                dom: 'Bft',

                scrollX: true,
                scrollY: '400px',
                scrollCollapse: true,

                paging: false,
                ordering: false,
                autoWidth: false,

                fixedColumns: {
                    leftColumns: 3
                },

                buttons: [
                    {
                        extend: 'excelHtml5',
                        text: 'Excel',
                        exportOptions: {
                            format: {
                                header: function (data, columnIdx) {
                                    return exportHeaders[columnIdx] || data;
                                }
                            }
                        }
                    }
                ],

                initComplete: function () {
                    $('#load1').hide();
                },

                footerCallback: function () {

                    const api = this.api();

                    const intVal = (i) =>
                        typeof i === 'string'
                            ? i.replace(/[\$,]/g, '') * 1
                            : typeof i === 'number'
                                ? i
                                : 0;

                    for (let i = fixedCols; i < api.columns().count(); i++) {

                        const total = api.column(i).data()
                            .reduce((a, b) => intVal(a) + intVal(b), 0);

                        $(api.column(i).footer()).html(
                            new Intl.NumberFormat().format(total)
                        );
                    }
                }
            });

        },

        error: function (err) {
            $('#load1').hide();
            console.error(err);
            alert("Error loading dashboard");
        }
    });

    return false;
}

function dashboard_arBind_displayERP_FinalVersion1() {

    $('#load1').show();

    const table = $('#dashboard_ar');
    table.empty();

    $.ajax({
        url: "Dashboard.aspx/GetClientwiseDashboard_ERpData",
        type: "POST",
        dataType: "json",
        contentType: "application/json; charset=utf-8",

        success: function (data) {

            const dataArray = JSON.parse(data.d);

            if (!dataArray || dataArray.length === 0) {
                $('#load1').hide();
                return;
            }

            // ================= COLUMNS =================
            const columns = Object.keys(dataArray[0])
                .filter(c => c !== "ProjectId" && c !== "ResultID");

            const fixedCols = 3;

            // ================= MONTH CLEANER =================
            function getMonthName(col) {
                return col
                    .replace(/-ERP-/g, "-")
                    .replace("-LoanCount", "")
                    .replace("-Amount", "")
                    .replace(/-+/g, "-")
                    .replace(/-$/, "");
            }

            // ================= CALCULATE TOTALS =================
            const totals = new Array(columns.length).fill(0);

            dataArray.forEach(item => {
                columns.forEach((col, i) => {
                    if (i >= fixedCols) {
                        totals[i] += Number(item[col] || 0);
                    }
                });
            });

            // ================= HEADER =================
            const thead = $('<thead/>');
            const row1 = $('<tr/>');
            const row2 = $('<tr/>');

            // Fixed columns
            for (let i = 0; i < fixedCols; i++) {
                row1.append(`
                    <th rowspan="2" style="vertical-align:middle; text-align:center;">
                        ${columns[i]}
                    </th>
                `);
            }

            // Month columns
            for (let i = fixedCols; i < columns.length; i += 2) {

                const month = getMonthName(columns[i]);

                // Month name
                row1.append(`
                    <th colspan="2" style="text-align:center;">
                        ${month}
                    </th>
                `);

                // 👉 TOTALS shown under month
                row2.append(`
                    <th style="text-align:center;">
                        ${new Intl.NumberFormat().format(totals[i])}
                    </th>
                `);

                row2.append(`
                    <th style="text-align:center;">
                        $ ${new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }).format(totals[i + 1])}
                    </th>
                `);
            }

            thead.append(row1).append(row2);
            table.append(thead);

            // ================= BODY =================
            const tbody = $('<tbody/>');

            dataArray.forEach(item => {

                const tr = $('<tr/>');

                columns.forEach((col, i) => {

                    let value = item[col];

                    if (!value) value = 0;

                    if (i < fixedCols) {
                        tr.append(`<td>${value}</td>`);
                    } else {

                        if ((i - fixedCols) % 2 === 0) {
                            // COUNT
                            tr.append(`
                                <td style="text-align:center;">
                                    ${new Intl.NumberFormat().format(Number(value))}
                                </td>
                            `);
                        } else {
                            // US $
                            tr.append(`
                                <td style="text-align:center;">
                                    $ ${new Intl.NumberFormat('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            }).format(Number(value))}
                                </td>
                            `);
                        }
                    }
                });

                tbody.append(tr);
            });

            table.append(tbody);

            // ================= DATATABLE =================
            table.DataTable({
                destroy: true,
                dom: 'Bft',

                scrollX: true,
                scrollY: '400px',
                scrollCollapse: true,

                paging: false,
                ordering: false,
                autoWidth: false,

                fixedColumns: {
                    leftColumns: fixedCols
                },

                initComplete: function () {
                    $('#load1').hide();
                }
            });

        },

        error: function (err) {
            $('#load1').hide();
            console.error(err);
            alert("Error loading dashboard");
        }
    });

    return false;
}

function dashboard_arBind_displayERP_V2() {

    $('#load1').show();

    const table = $('#dashboard_ar');
    table.empty();

    $.ajax({
        url: "Dashboard.aspx/GetClientwiseDashboard_ERpData",
        type: "POST",
        dataType: "json",
        contentType: "application/json; charset=utf-8",

        success: function (data) {

            const dataArray = JSON.parse(data.d);

            if (!dataArray || dataArray.length === 0) {
                $('#load1').hide();
                return;
            }

            const columns = Object.keys(dataArray[0])
                .filter(c => c !== "ProjectId" && c !== "ResultID");

            const fixedCols = 3;

            function getMonthName(col) {
                return col
                    .replace(/-ERP-/g, "-")
                    .replace("-LoanCount", "")
                    .replace("-Amount", "")
                    .replace(/-+/g, "-")
                    .replace(/-$/, "");
            }

            // ✅ Helper for USD format
            function formatUSD(val) {
                return '$ ' + new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }).format(Number(val || 0));
            }

            // ================= TOTALS =================
            const totals = new Array(columns.length).fill(0);

            dataArray.forEach(item => {
                columns.forEach((col, i) => {
                    if (i >= fixedCols) {
                        totals[i] += Number(item[col] || 0);
                    }
                });
            });

            // ================= HEADER =================
            const thead = $('<thead/>');
            const row1 = $('<tr/>');
            const row2 = $('<tr/>');

            // Fixed columns
            for (let i = 0; i < fixedCols; i++) {
                row1.append(`
                    <th rowspan="2" style="vertical-align:middle; text-align:center;">
                        ${columns[i]}
                    </th>
                `);
            }

            // Month columns
            for (let i = fixedCols; i < columns.length; i += 2) {

                const month = getMonthName(columns[i]);

                // Month name
                row1.append(`
                    <th colspan="2" style="text-align:center;">
                        ${month}
                    </th>
                `);

                // Count total
                row2.append(`
                    <th style="text-align:center;">
                        ${new Intl.NumberFormat().format(totals[i])}
                    </th>
                `);

                // ✅ US $ total (ALWAYS with $)
                row2.append(`
                    <th style="text-align:center;">
                        ${formatUSD(totals[i + 1])}
                    </th>
                `);
            }

            thead.append(row1).append(row2);
            table.append(thead);

            // ================= BODY =================
            const tbody = $('<tbody/>');

            dataArray.forEach(item => {

                const tr = $('<tr/>');

                columns.forEach((col, i) => {

                    let value = item[col];

                    if (!value) value = 0;

                    if (i < fixedCols) {
                        tr.append(`<td>${value}</td>`);
                    } else {

                        if ((i - fixedCols) % 2 === 0) {
                            // COUNT
                            tr.append(`
                                <td style="text-align:center;">
                                    ${new Intl.NumberFormat().format(Number(value))}
                                </td>
                            `);
                        } else {
                            // ✅ US $ with $
                            tr.append(`
                                <td style="text-align:center;">
                                    ${formatUSD(value)}
                                </td>
                            `);
                        }
                    }
                });

                tbody.append(tr);
            });

            table.append(tbody);

            // ================= DATATABLE =================
            table.DataTable({
                destroy: true,
                dom: 'Bft',

                scrollX: true,
                scrollY: '400px',
                scrollCollapse: true,

                paging: false,
                ordering: false,
                autoWidth: false,

                fixedColumns: {
                    leftColumns: fixedCols
                },

                initComplete: function () {
                    $('#load1').hide();
                }
            });

        },

        error: function (err) {
            $('#load1').hide();
            console.error(err);
            alert("Error loading dashboard");
        }
    });

    return false;
}

function dashboard_arBind_displayERP_Final2() {

    $('#load1').show();

    const table = $('#dashboard_ar');
    table.empty();

    $.ajax({
        url: "Dashboard.aspx/GetClientwiseDashboard_ERpData",
        type: "POST",
        dataType: "json",
        contentType: "application/json; charset=utf-8",

        success: function (data) {

            const dataArray = JSON.parse(data.d);

            if (!dataArray || dataArray.length === 0) {
                $('#load1').hide();
                return;
            }

            const columns = Object.keys(dataArray[0])
                .filter(c => c !== "ProjectId" && c !== "ResultID");

            const fixedCols = 3;

            function getMonthName(col) {
                return col
                    .replace(/-ERP-/g, "-")
                    .replace("-LoanCount", "")
                    .replace("-Amount", "")
                    .replace(/-+/g, "-")
                    .replace(/-$/, "");
            }

            function formatUSD(val) {
                return '$ ' + new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }).format(Number(val || 0));
            }

            const totals = new Array(columns.length).fill(0);

            dataArray.forEach(item => {
                columns.forEach((col, i) => {
                    if (i >= fixedCols) {
                        totals[i] += Number(item[col] || 0);
                    }
                });
            });

            // ================= HEADER =================
            const thead = $('<thead/>');
            const row1 = $('<tr/>');
            const row2 = $('<tr/>');

            for (let i = 0; i < fixedCols; i++) {
                row1.append(`
                    <th rowspan="2" style="vertical-align:middle; text-align:center;">
                        ${columns[i]}
                    </th>
                `);
            }

            for (let i = fixedCols; i < columns.length; i += 2) {

                const month = getMonthName(columns[i]);

                row1.append(`
                    <th colspan="2" style="text-align:center;">
                        ${month}
                    </th>
                `);

                // Count total (RIGHT aligned)
                row2.append(`
                    <th style="text-align:right;">
                        ${new Intl.NumberFormat().format(totals[i])}
                    </th>
                `);

                // USD total (ACCOUNTING RIGHT aligned)
                row2.append(`
                    <th style="text-align:right;">
                        ${formatUSD(totals[i + 1])}
                    </th>
                `);
            }

            thead.append(row1).append(row2);
            table.append(thead);

            // ================= BODY =================
            const tbody = $('<tbody/>');

            dataArray.forEach(item => {

                const tr = $('<tr/>');

                columns.forEach((col, i) => {

                    let value = item[col] || 0;

                    if (i < fixedCols) {
                        tr.append(`<td>${value}</td>`);
                    } else {

                        if ((i - fixedCols) % 2 === 0) {
                            // COUNT (RIGHT aligned)
                            tr.append(`
                                <td style="text-align:right;">
                                    ${new Intl.NumberFormat().format(Number(value))}
                                </td>
                            `);
                        } else {
                            // USD (ACCOUNTING FORMAT)
                            tr.append(`
                                <td style="text-align:right; font-variant-numeric: tabular-nums;">
                                    ${formatUSD(value)}
                                </td>
                            `);
                        }
                    }
                });

                tbody.append(tr);
            });

            table.append(tbody);

            // ================= DATATABLE =================
            table.DataTable({
                destroy: true,
                dom: 'Bft',

                scrollX: true,
                scrollY: '400px',
                scrollCollapse: true,

                paging: false,
                ordering: false,
                autoWidth: false,

                fixedColumns: {
                    leftColumns: fixedCols
                },

                initComplete: function () {
                    $('#load1').hide();
                }
            });

        },

        error: function (err) {
            $('#load1').hide();
            console.error(err);
            alert("Error loading dashboard");
        }
    });

    return false;
}

function dashboard_arBind_displayERPSort1() {

    $('#load1').show();

    const table = $('#dashboard_ar');
    table.empty();

    $.ajax({
        url: "Dashboard.aspx/GetClientwiseDashboard_ERpData",
        type: "POST",
        dataType: "json",
        contentType: "application/json; charset=utf-8",

        success: function (data) {

            const dataArray = JSON.parse(data.d);

            if (!dataArray || dataArray.length === 0) {
                $('#load1').hide();
                return;
            }

            const columns = Object.keys(dataArray[0])
                .filter(c => c !== "ProjectId" && c !== "ResultID");

            const fixedCols = 3;

            function getMonthName(col) {
                return col
                    .replace(/-ERP-/g, "-")
                    .replace("-LoanCount", "")
                    .replace("-Amount", "")
                    .replace(/-+/g, "-")
                    .replace(/-$/, "");
            }

            function formatUSD(val) {
                return '$ ' + new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }).format(Number(val || 0));
            }

            const totals = new Array(columns.length).fill(0);

            dataArray.forEach(item => {
                columns.forEach((col, i) => {
                    if (i >= fixedCols) {
                        totals[i] += Number(item[col] || 0);
                    }
                });
            });

            // ================= HEADER =================
            const thead = $('<thead/>');
            const row1 = $('<tr/>');
            const row2 = $('<tr/>');

            // FIXED COLUMNS
            for (let i = 0; i < fixedCols; i++) {
                row1.append(`
                    <th rowspan="2" style="vertical-align:middle; text-align:center;">
                        ${columns[i]}
                    </th>
                `);
            }

            // MONTH COLUMNS (PAIR: COUNT + AMOUNT)
            for (let i = fixedCols; i < columns.length; i += 2) {

                const month = getMonthName(columns[i]);

                row1.append(`
                    <th colspan="2" 
                        class="month-header" 
                        data-col="${i}"
                        style="text-align:center; cursor:pointer; background:#f5f5f5;">
                        ${month}
                    </th>
                `);

                // COUNT TOTAL
                row2.append(`
                    <th style="text-align:right;">
                        ${new Intl.NumberFormat().format(totals[i])}
                    </th>
                `);

                // AMOUNT TOTAL
                row2.append(`
                    <th style="text-align:right;">
                        ${formatUSD(totals[i + 1])}
                    </th>
                `);
            }

            thead.append(row1).append(row2);
            table.append(thead);

            // ================= BODY =================
            const tbody = $('<tbody/>');

            dataArray.forEach(item => {

                const tr = $('<tr/>');

                columns.forEach((col, i) => {

                    let value = item[col] || 0;

                    if (i < fixedCols) {
                        tr.append(`<td>${value}</td>`);
                    } else {

                        if ((i - fixedCols) % 2 === 0) {
                            // COUNT
                            tr.append(`
                                <td style="text-align:right;">
                                    ${new Intl.NumberFormat().format(Number(value))}
                                </td>
                            `);
                        } else {
                            // AMOUNT
                            tr.append(`
                                <td style="text-align:right; font-variant-numeric: tabular-nums;">
                                    ${formatUSD(value)}
                                </td>
                            `);
                        }
                    }
                });

                tbody.append(tr);
            });

            table.append(tbody);

            // ================= DATATABLE =================
            const dt = table.DataTable({
                destroy: true,
                dom: 'Bft',

                scrollX: true,
                scrollY: '400px',
                scrollCollapse: true,

                paging: false,
                ordering: true,
                autoWidth: false,

                fixedColumns: {
                    leftColumns: fixedCols
                },

                order: [],

                initComplete: function () {
                    $('#load1').hide();
                }
            });

            // ================= MONTH CLICK SORT =================
            table.on('click', '.month-header', function () {

                const colIndex = $(this).data('col');

                // SORT BY COUNT COLUMN (first of pair)
                const targetColumn = colIndex;

                const currentOrder = dt.order();

                let dir = 'asc';

                if (currentOrder.length &&
                    currentOrder[0][0] === targetColumn &&
                    currentOrder[0][1] === 'asc') {
                    dir = 'desc';
                }

                dt.order([targetColumn, dir]).draw();
            });

        },

        error: function (err) {
            $('#load1').hide();
            console.error(err);
            alert("Error loading dashboard");
        }
    });

    return false;
}


function dashboard_arBind_displayERP_LIVE() {

    $('#load1').show();

    const table = $('#dashboard_ar');
    table.empty();

    $.ajax({
        url: "Dashboard.aspx/GetClientwiseDashboard_ERpData",
        type: "POST",
        dataType: "json",
        contentType: "application/json; charset=utf-8",

        success: function (data) {

            const dataArray = JSON.parse(data.d);

            if (!dataArray || dataArray.length === 0) {
                $('#load1').hide();
                return;
            }

            const columns = Object.keys(dataArray[0])
                .filter(c => c !== "ProjectId" && c !== "ResultID");

            const fixedCols = 3;

            function getMonthName(col) {
                return col
                    .replace(/-ERP-/g, "-")
                    .replace("-LoanCount", "")
                    .replace("-Amount", "")
                    .replace(/-+/g, "-")
                    .replace(/-$/, "");
            }

            function formatUSD(val) {
                return '$ ' + new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }).format(Number(val || 0));
            }

            // ================= TOTALS =================
            const totals = new Array(columns.length).fill(0);

            dataArray.forEach(item => {
                columns.forEach((col, i) => {
                    if (i >= fixedCols) {
                        totals[i] += Number(item[col] || 0);
                    }
                });
            });

            // ================= HEADER =================
            const thead = $('<thead/>');
            const row1 = $('<tr/>');
            const row2 = $('<tr/>');

            for (let i = 0; i < fixedCols; i++) {
                row1.append(`
                    <th rowspan="2" style="vertical-align:middle; text-align:center;">
                        ${columns[i]}
                    </th>
                `);
            }

            for (let i = fixedCols, m = 0; i < columns.length; i += 2, m++) {

                const month = getMonthName(columns[i]);

                row1.append(`
                    <th colspan="2"
                        class="month-header"
                        data-month-index="${m}"
                        data-col="${i}"
                        style="text-align:center; cursor:pointer; background:#f5f5f5;">
                        ${month}
                    </th>
                `);

                row2.append(`
                    <th style="text-align:right;">
                        ${new Intl.NumberFormat().format(totals[i])}
                    </th>
                `);

                row2.append(`
                    <th style="text-align:right;">
                        ${formatUSD(totals[i + 1])}
                    </th>
                `);
            }

            thead.append(row1).append(row2);
            table.append(thead);

            // ================= BODY =================
            const tbody = $('<tbody/>');

            dataArray.forEach(item => {

                const tr = $('<tr/>');

                columns.forEach((col, i) => {

                    let value = item[col] || 0;

                    if (i < fixedCols) {
                        tr.append(`<td>${value}</td>`);
                    } else {

                        if ((i - fixedCols) % 2 === 0) {
                            tr.append(`
                                <td style="text-align:right;">
                                    ${new Intl.NumberFormat().format(Number(value))}
                                </td>
                            `);
                        } else {
                            tr.append(`
                                <td style="text-align:right;">
                                    ${formatUSD(value)}
                                </td>
                            `);
                        }
                    }
                });

                tbody.append(tr);
            });

            table.append(tbody);

            // ================= DATATABLE =================
            const dt = table.DataTable({
                destroy: true,

                dom: 'Bft',
                buttons: [
                    {
                        extend: 'excelHtml5',
                        text: 'Export Excel',
                        title: 'ERP Dashboard',

                        customize: function (xlsx) {

                            const sheet = xlsx.xl.worksheets['sheet1.xml'];

                            let xml = '';

                            // ===== HEADER ROW 1 =====
                            xml += '<row r="1">';

                            for (let i = 0; i < fixedCols; i++) {
                                xml += `<c t="inlineStr"><is><t>${columns[i]}</t></is></c>`;
                            }

                            let excelCol = fixedCols;

                            for (let i = fixedCols; i < columns.length; i += 2) {

                                const month = getMonthName(columns[i]);

                                xml += `<c t="inlineStr"><is><t>${month}</t></is></c>`;
                                xml += `<c t="inlineStr"><is><t></t></is></c>`;

                                excelCol += 2;
                            }

                            xml += '</row>';

                            // ===== HEADER ROW 2 =====
                            xml += '<row r="2">';

                            for (let i = 0; i < fixedCols; i++) {
                                xml += `<c t="inlineStr"><is><t>${columns[i]}</t></is></c>`;
                            }

                            for (let i = fixedCols; i < columns.length; i += 2) {

                                xml += `<c t="inlineStr"><is><t>Count</t></is></c>`;
                                xml += `<c t="inlineStr"><is><t>Amount</t></is></c>`;
                            }

                            xml += '</row>';

                            sheet.childNodes[0].childNodes[1].innerHTML =
                                xml + sheet.childNodes[0].childNodes[1].innerHTML;
                        }
                    }
                ],

                scrollX: true,
                scrollY: '400px',
                scrollCollapse: true,

                paging: false,
                ordering: true,
                autoWidth: false,

                fixedColumns: {
                    leftColumns: fixedCols
                },

                order: [],

                initComplete: function () {
                    $('#load1').hide();
                }
            });

            // ================= MONTH CLICK SORT (COMBINED COUNT + AMOUNT) =================
            table.on('click', '.month-header', function () {

                const monthIndex = $(this).data('month-index');

                const countIndex = fixedCols + (monthIndex * 2);
                const amountIndex = countIndex + 1;

                const dtApi = table.DataTable();

                const currentOrder = dtApi.order();

                let dir = 'asc';

                if (currentOrder.length &&
                    currentOrder[0][0] === countIndex &&
                    currentOrder[0][1] === 'asc') {
                    dir = 'desc';
                }

                // Custom sort: COUNT + AMOUNT combined
                $.fn.dataTable.ext.order['month-combined-' + monthIndex] = function (settings, col) {

                    const api = new $.fn.dataTable.Api(settings);

                    return api.rows({ order: 'index' }).data().map(function (row, i) {

                        const count = Number(row[countIndex] || 0);
                        const amount = Number(row[amountIndex] || 0);

                        return count + amount; // COMBINED SORT VALUE
                    });
                };

                dtApi.order([countIndex, dir]).draw();

                dtApi.rows().invalidate().draw();
            });

        },

        error: function (err) {
            $('#load1').hide();
            console.error(err);
            alert("Error loading dashboard");
        }
    });

    return false;
}

function dashboard_arBind_displayERP() {

    $('#load1').show();

    const table = $('#dashboard_ar');
    table.empty();

    $.ajax({
        url: "Dashboard.aspx/GetClientwiseDashboard_ERpData",
        type: "POST",
        dataType: "json",
        contentType: "application/json; charset=utf-8",

        success: function (data) {

            const dataArray = JSON.parse(data.d);

            if (!dataArray || dataArray.length === 0) {
                $('#load1').hide();
                return;
            }

            const fixedCols = 3;

            const columns = Object.keys(dataArray[0])
                .filter(c => c !== "ProjectId" && c !== "ResultID");

            const groupSize = 3; // ✅ NEW: Count + Amount + Rate

            function getMonthName(col) {
                return col
                    .replace(/-ERP-/g, "-")
                    .replace("-LoanCount", "")
                    .replace("-Amount", "")
                    .replace("-Rate", "")
                    .replace(/-+/g, "-")
                    .replace(/-$/, "");
            }

            function formatUSD(val) {
                return '$ ' + new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }).format(Number(val || 0));
            }

            // ================= TOTALS =================
            const totals = new Array(columns.length).fill(0);

            dataArray.forEach(item => {
                columns.forEach((col, i) => {
                    if (i >= fixedCols) {
                        totals[i] += Number(item[col] || 0);
                    }
                });
            });

            // ================= HEADER =================
            const thead = $('<thead/>');
            const row1 = $('<tr/>');
            const row2 = $('<tr/>');

            for (let i = 0; i < fixedCols; i++) {
                row1.append(`
                    <th rowspan="2" style="vertical-align:middle;text-align:center;">
                        ${columns[i]}
                    </th>
                `);
            }

            for (let i = fixedCols, m = 0; i < columns.length; i += groupSize, m++) {

                const month = getMonthName(columns[i]);

                row1.append(`
                    <th colspan="${groupSize}"
                        class="month-header"
                        data-month-index="${m}"
                        data-col="${i}"
                        style="text-align:center;cursor:pointer;background:#f5f5f5;">
                        ${month}
                    </th>
                `);

                row2.append(`<th style="text-align:right;">Count</th>`);
                row2.append(`<th style="text-align:right;">Amount</th>`);
                row2.append(`<th style="text-align:right;">Rate</th>`);
            }

            thead.append(row1).append(row2);
            table.append(thead);

            // ================= BODY =================
            const tbody = $('<tbody/>');

            dataArray.forEach(item => {

                const tr = $('<tr/>');

                columns.forEach((col, i) => {

                    let value = item[col] || 0;

                    if (i < fixedCols) {
                        tr.append(`<td>${value}</td>`);
                    } else {

                        const pos = (i - fixedCols) % groupSize;

                        if (pos === 0) {
                            tr.append(`<td style="text-align:right;">
                                ${new Intl.NumberFormat().format(Number(value))}
                            </td>`);
                        }

                        if (pos === 1) {
                            tr.append(`<td style="text-align:right;">
                                ${formatUSD(value)}
                            </td>`);
                        }

                        if (pos === 2) {
                            tr.append(`<td style="text-align:right;">
                                ${new Intl.NumberFormat().format(Number(value))}
                            </td>`);
                        }
                    }
                });

                tbody.append(tr);
            });

            table.append(tbody);

            // ================= DATATABLE =================
            const dt = table.DataTable({
                destroy: true,
                dom: 'Bft',
                buttons: [
                    {
                        extend: 'excelHtml5',
                        text: 'Export Excel',
                        title: 'ERP Dashboard',

                        customize: function (xlsx) {

                            const sheet = xlsx.xl.worksheets['sheet1.xml'];
                            let xml = '';

                            // ===== HEADER ROW 1 =====
                            xml += '<row r="1">';

                            for (let i = 0; i < fixedCols; i++) {
                                xml += `<c t="inlineStr"><is><t>${columns[i]}</t></is></c>`;
                            }

                            for (let i = fixedCols; i < columns.length; i += groupSize) {

                                const month = getMonthName(columns[i]);

                                xml += `<c t="inlineStr"><is><t>${month}</t></is></c>`;
                                xml += `<c t="inlineStr"><is><t></t></is></c>`;
                                xml += `<c t="inlineStr"><is><t></t></is></c>`;
                            }

                            xml += '</row>';

                            // ===== HEADER ROW 2 =====
                            xml += '<row r="2">';

                            for (let i = 0; i < fixedCols; i++) {
                                xml += `<c t="inlineStr"><is><t>${columns[i]}</t></is></c>`;
                            }

                            for (let i = fixedCols; i < columns.length; i += groupSize) {
                                xml += `<c t="inlineStr"><is><t>Count</t></is></c>`;
                                xml += `<c t="inlineStr"><is><t>Amount</t></is></c>`;
                                xml += `<c t="inlineStr"><is><t>Rate</t></is></c>`;
                            }

                            xml += '</row>';

                            sheet.childNodes[0].childNodes[1].innerHTML =
                                xml + sheet.childNodes[0].childNodes[1].innerHTML;
                        }
                    }
                ],

                scrollX: true,
                scrollY: '400px',
                scrollCollapse: true,
                paging: false,
                ordering: true,
                autoWidth: false,

                fixedColumns: {
                    leftColumns: fixedCols
                },

                initComplete: function () {
                    $('#load1').hide();
                }
            });

            // ================= MONTH CLICK SORT =================
            table.on('click', '.month-header', function () {

                const monthIndex = $(this).data('month-index');

                const baseIndex = fixedCols + (monthIndex * groupSize);

                const dtApi = table.DataTable();

                const currentOrder = dtApi.order();

                let dir = 'asc';

                if (currentOrder.length &&
                    currentOrder[0][0] === baseIndex &&
                    currentOrder[0][1] === 'asc') {
                    dir = 'desc';
                }

                dtApi.order([baseIndex, dir]).draw();
            });

        },

        error: function (err) {
            $('#load1').hide();
            console.error(err);
            alert("Error loading dashboard");
        }
    });

    return false;
}





// -------   Daily Volume
function dvol_bindyear() {
    var start = new Date().getFullYear();

    var select = document.getElementById("dvol_year");
    let options = select.getElementsByTagName('option');

    for (var i = options.length; i--;) {
        select.removeChild(options[i]);
    }

    $("#dvol_year").append($("<option></option>").val("").html("Select"));
    for (var i = start; i > start - 5; i--) {
        $("#dvol_year").append($("<option></option>").val(i).html(i));
    }
}

function dvol_bindgrid() {
    $('#load1').show();
    var ddlmonth = document.getElementById("dvol_month");
    var month = ddlmonth.options[ddlmonth.selectedIndex].value;
    var ddlyear = document.getElementById("dvol_year");
    var year = ddlyear.options[ddlyear.selectedIndex].value;
    var columns = [];
    $.ajax({
        url: "DailyVolume.aspx/GetDailyVolumeReport",
        type: "POST",
        data: "{Month:'" + month + "', Year:'" + year + "'}",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            var dataArray = JSON.parse(data.d);//

            $.each(dataArray[0], function (key, value) {

                var my_item = {};
                my_item.data = key;

                if (key.startsWith("ApproxCost")) {
                    my_item.title = "Approx. Cost";
                    my_item.className = "date-group-end";   // 👈 IMPORTANT
                } else {
                    my_item.title = key;
                }


                columns.push(my_item);
            });

            //$.each(dataArray[0], function (key, value) {
            //    // alert(key);
            //    var my_item = {};
            //    my_item.data = key;
            //    my_item.title = key;
            //    columns.push(my_item);
            //});

            $('#dvol_table').DataTable({
                dom: 'Bftp',
                scrollX: true,
                destroy: true,
                "paging": true,
                "autoWidth": true,
                select: true,
                "ordering": false,
                processing: true,
                'select': {
                    'style': 'single'
                },
                "data": dataArray,
                "columns": columns,
                buttons: [
                    {
                        extend: 'excelHtml5', title: 'Daily Volume Report', autoFilter: true,


                    },


                ],

                initComplete: function () {
                    $('#load1').hide();
                },

                "rowCallback": function (row, data) {
                    var val = data[3];
                },

                fnCreatedRow: function (nRow, aData, iDataIndex) {                    
                    $(nRow).children("td").css("text-wrap", "nowrap");
                },
            });
        },
        error: function (error) {
            alert('error; ' + eval(error));
            alert('error; ' + error.responseText);
        }
    });
    return false;
}
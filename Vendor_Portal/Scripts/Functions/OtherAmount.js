var payentOtherAmount_table;

function blankForNull(s) {
    return s == "null" || s == null ? "" : s;
}

function payentOther_bindyear() {
    var start = new Date().getFullYear();

    var select = document.getElementById("payentOtherAmount_year");
    let options = select.getElementsByTagName('option');

    for (var i = options.length; i--;) {
        select.removeChild(options[i]);
    }

    $("#payentOtherAmount_year").append($("<option></option>").val("").html("Select"));
    for (var i = start; i > start - 5; i--) {
        $("#payentOtherAmount_year").append($("<option></option>").val(i).html(i));
    }
}

function payentOtherAmount_bindPendingGrid_LiVE() {
    $('#load1').show();
    var columns = [];
    var ddlmonth = document.getElementById("payentOtherAmount_month");
    var month = ddlmonth.options[ddlmonth.selectedIndex].value;
    var ddlyear = document.getElementById("payentOtherAmount_year");
    var year = ddlyear.options[ddlyear.selectedIndex].value;
    $.ajax({
        url: "OtherBillingAmontMaster.aspx/GetOtherAmount",
        type: "POST",
        dataType: "json",
        data: "{Month:'" + month + "',Year:'" + year + "'}",
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            var dataArray = JSON.parse(data.d);//
            if (dataArray.length > 0) {
                document.getElementById("payentOtherAmount_btnupdatedata").style.display = 'inline';
            }
            else
                document.getElementById("payentOtherAmount_btnupdatedata").style.display = 'none';

            if ($.fn.dataTable.isDataTable('#payentOtherAmount_table')) {
                $('#payentOtherAmount_table').DataTable().destroy();
            }
            payentOtherAmount_table = $('#payentOtherAmount_table').DataTable({
                dom: 'ftip',
                destroy: true,
                scrollX: true,
                "paging": false,
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
                columns: [
                    { data: 'Project' },
                    { data: 'BillingPeriod' },
                    { data: 'ChargeType' },
                    { data: 'Amount1' },
                    { data: 'Display1' },
                ],
                columnDefs: [
                    {
                        targets: 3,
                        "width": "250px",
                        render: function (data, type, row, meta) {
                            if (data == null)
                                return '<input id="OtherAmount1_' + meta.row + '" class="form-control" style="width:250px;" />';
                            else
                                return '<input id="OtherAmount1_' + meta.row + '" class="form-control" style="width:250px;" value="' + data + '" />';
                        }
                    }
                ],

                initComplete: function () {
                    $('#load1').hide();

                },
                buttons: [
                    {
                        extend: 'excelHtml5', title: 'Pending Deals', autoFilter: true,
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

function payentOtherAmount_verifysubmit() {

    var dataList = [];

    payentOtherAmount_table.rows().every(function (index) {

        var ids = document.getElementById("OtherAmount1_" + index);
        var ids1 = document.getElementById("Display1_" + index);

        //alert(ids)
        //alert(ids1)

        

        if (ids.value != "") {

            var row = payentOtherAmount_table.row(index).data();

            dataList.push({
                Project: row.Project,
                BillingPeriod: row.BillingPeriod,
                ChargeType: row.ChargeType,
                Amount: parseFloat(ids.value),
                DisplayName: ids1.value
            });
        }
    });

    if (dataList.length > 0) {
        PageMethods.UpdatePayentOtherAmount(
            JSON.stringify(dataList),
            payentOtherAmount_OnSuccess,
            payentOtherAmount_OnError
        );
    }

    return false;
}

function payentOtherAmount_bindPendingGrid() {
    $('#load1').show();

    var ddlmonth = document.getElementById("payentOtherAmount_month");
    var month = ddlmonth.options[ddlmonth.selectedIndex].value;

    var ddlyear = document.getElementById("payentOtherAmount_year");
    var year = ddlyear.options[ddlyear.selectedIndex].value;

    $.ajax({
        url: "OtherBillingAmontMaster.aspx/GetOtherAmount",
        type: "POST",
        dataType: "json",
        data: "{Month:'" + month + "',Year:'" + year + "'}",
        contentType: "application/json; charset=utf-8",

        success: function (data) {

            var dataArray = JSON.parse(data.d);

            if (dataArray.length > 0) {
                document.getElementById("payentOtherAmount_btnupdatedata").style.display = 'inline';
            } else {
                document.getElementById("payentOtherAmount_btnupdatedata").style.display = 'none';
            }

            if ($.fn.dataTable.isDataTable('#payentOtherAmount_table')) {
                $('#payentOtherAmount_table').DataTable().destroy();
            }

            payentOtherAmount_table = $('#payentOtherAmount_table').DataTable({
                dom: 'ftip',
                destroy: true,
                scrollX: true,
                paging: false,
                pageLength: 10,
                select: {
                    style: 'single'
                },
                ordering: false,
                processing: true,
                filter: true,
                serverSide: false,

                data: dataArray,

                columns: [
                    { data: 'Project' },
                    { data: 'BillingPeriod' },
                    { data: 'ChargeType' },
                    { data: 'Amount1' },
                    { data: 'Display1' }
                ],

                // ✅ BOTH COLUMNS MADE EDITABLE
                columnDefs: [

                    // Amount1 editable (column index 3)
                    {
                        targets: 3,
                        "width": "250px",
                        render: function (data, type, row, meta) {
                            if (data == null)
                                return '<input id="OtherAmount1_' + meta.row + '" class="form-control" style="width:250px;" />';
                            else
                                return '<input id="OtherAmount1_' + meta.row + '" class="form-control" style="width:250px;" value="' + data + '" />';
                        }
                    },

                    // Display1 editable (column index 4)
                    {
                        targets: 4,
                        "width": "250px",
                        render: function (data, type, row, meta) {
                            if (data == null)
                                return '<input id="Display1_' + meta.row + '" class="form-control" style="width:250px;" />';
                            else
                                return '<input id="Display1_' + meta.row + '" class="form-control" style="width:250px;" value="' + data + '" />';
                        }
                    }
                ],

                initComplete: function () {
                    $('#load1').hide();
                },

                buttons: [
                    {
                        extend: 'excelHtml5',
                        title: 'Pending Deals',
                        autoFilter: true
                    }
                ]
            });
        },

        error: function (error) {
            alert('error: ' + error.responseText);
        }
    });

    return false;
}



function payentOtherAmount_verifysubmit_Old() {
    var index = 0;
    var params;

    payentOtherAmount_table.rows().every(function (index, element) {
        var ids = document.getElementById("OtherAmount1_" + index);
        if (ids.value != "") {
            var rowData = payentOtherAmount_table.row(index).data();
            var Project = payentOtherAmount_table.row(index).data().Project;
            var BillingPeriod = payentOtherAmount_table.row(index).data().BillingPeriod;
            var ChargeType = payentOtherAmount_table.row(index).data().ChargeType;
            //if (index == 0)
            //    params = Project + ':' + BillingPeriod + '_' + ChargeType + '_' + ids.value;
            //else
                params = Project + ':' + BillingPeriod + '_' + ChargeType + '_' + ids.value + '_' + ids.value;
        }
    });
    if (params != "") {
        PageMethods.UpdatePayentOtherAmount(params, payentOtherAmount_OnSuccess, payentOtherAmount_OnError);
        return false;
    }
    return false;
}

function payentOtherAmount_OnSuccess(result) {
    alert("Details updated successfully");
    payentOtherAmount_bindPendingGrid();
    return false;
}
function payentOtherAmount_OnError(error) {
    alert(error.responseText);
}
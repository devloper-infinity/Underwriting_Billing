var bpd_price_table;
var bpd_price_html = '';
const chkIds = [];
var ProjectID_param;

function GetCheckedCheckboxes(ID) {
    if (ID.checked) {
        if (!chkIds.includes(ID.id)) {
            chkIds.push(ID.id);
        }
    }
    else {
        if (chkIds.includes(ID.id)) {
            chkIds.splice(chkIds.indexOf(ID.id), 1);
        }
    }

    return false;
}

function blankForNull(s) {
    return s == "null" || s == null ? "" : s;
}

function BindCostingParameters() {
    $('#load1').show();
    const urlParams = new URLSearchParams(window.location.search);
    const ProcessID = urlParams.get('ProcessID');
    bpd_price_html = '';
    $.ajax({
        url: "PriceConfiguration.aspx/GetProjectDetailsbyprocessID",
        type: "POST",
        dataType: "json",
        data: "{ProcessID:" + ProcessID + "}",
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            var dataArray = JSON.parse(data.d);//
            $.each(dataArray, function (index, value) {
                var ProjectId = value.ProjectId;
                var ProcessName = value.ProcessName;
                document.getElementById("goback_price").href = "ProjectDetails.aspx?ProjectID=" + ProjectId;
                document.getElementById("price_project_id").innerHTML = ProjectId;
                document.getElementById("price_process_name").innerHTML = ProcessName;
                document.getElementById("bpd_header_price").innerHTML = "Billing Parameter and Costing Configuration : " + ProcessName;
                ProjectID_param = ProjectId;
                //////////////////Bind Grid
                $.ajax({
                    url: "PriceConfiguration.aspx/getAllBillingParameters",
                    type: "POST",
                    dataType: "json",
                    data: "{ProjectID:" + ProjectId + ", ClientProcess:'" + ProcessName + "'}",
                    contentType: "application/json; charset=utf-8",
                    success: function (data1) {
                        var dataArray1 = JSON.parse(data1.d);//

                        $.each(dataArray1, function (index, value1) {
                            if (value1.IBP_Id == 1) {
                                var baserate = blankForNull(value1.IBV_Remark);
                                if (baserate == "") baserate = "0";
                                document.getElementById("price_baserate").value = baserate;
                            }
                            else {
                                bpd_price_html += '<tr>';
                                bpd_price_html += '<td style="text-wrap: nowrap;text-align:center; display:none;">' + blankForNull((index + 1)) + '</td>';
                                if (blankForNull(value1.IBV_ChargeType) != "Select" && blankForNull(value1.IBV_ChargeType) != "") {
                                    bpd_price_html += '<td style="text-wrap: nowrap;"><input checked="checked" type="checkbox" id="' + value1.IBP_Id + '" onclick="GetCheckedCheckboxes(this,' + index + ')" /></td>';
                                    if (!chkIds.includes(value1.IBP_Id)) {
                                        chkIds.push(value1.IBP_Id);
                                    }
                                }
                                else
                                    bpd_price_html += '<td style="text-wrap: nowrap;"><input type="checkbox" id="' + value1.IBP_Id + '" onclick="GetCheckedCheckboxes(this,' + index + ')" /></td>';
                                bpd_price_html += '<td style="text-wrap: nowrap;" id="bpd_paramname_' + value1.IBP_Id + '">' + blankForNull(value1.IBP_ParameterName) + '</td>';
                                bpd_price_html += '<td style="text-wrap: nowrap;"><select class="form-control" id="bpd_billingtype_' + value1.IBP_Id + '" style="width:100px; height:26px;"><option value="">select</option>';

                                const billingtype = value1.IBP_BillingType.split("/");
                                for (let i = 0; i < billingtype.length; i++) {
                                    let options = billingtype[i];
                                    if (value1.IBV_BillingType == options)
                                        bpd_price_html += '<option value="' + options + '" selected>' + options + '</option>';
                                    else
                                        bpd_price_html += '<option value="' + options + '">' + options + '</option>';
                                }
                                bpd_price_html += '</select></td>';
                                bpd_price_html += '<td style="text-wrap: nowrap;"><input class="form-control" type="text" id="bpd_price_' + value1.IBP_Id + '" style="width:100px; height:26px;" value="' + blankForNull(value1.IBV_Remark) + '"/></td>';
                                if (value1.IBV_ChargeType == "Fix Amount")
                                    bpd_price_html += '<td style="text-wrap: nowrap; "><select class="form-control" id="bpd_chargetype_' + value1.IBP_Id + '" style="width:120px; height:26px;"><option value="">select</option><option value="Fix Amount" selected>Fix Amount</option><option value="Variable">Variable</option></select></td>';
                                else if (value1.IBV_ChargeType == "Variable")
                                    bpd_price_html += '<td style="text-wrap: nowrap; "><select class="form-control" id="bpd_chargetype_' + value1.IBP_Id + '" style="width:120px; height:26px;"><option value="">select</option><option value="Fix Amount">Fix Amount</option><option value="Variable" selected>Variable</option></select></td>';
                                else
                                    bpd_price_html += '<td style="text-wrap: nowrap; "><select class="form-control" id="bpd_chargetype_' + value1.IBP_Id + '" style="width:120px; height:26px;"><option value="">select</option><option value="Fix Amount">Fix Amount</option><option value="Variable">Variable</option></select></td>';
                                bpd_price_html += '</tr>';
                            }
                        });

                        if ($.fn.dataTable.isDataTable('#bpd_price_table')) {
                            bpd_price_table.destroy();
                        }
                        $('#bpd_price_table tbody').html(bpd_price_html);
                        //else
                        bpd_price_table = $('#bpd_price_table').DataTable({
                            dom: 't',
                            scrollX: true,
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

                            buttons: [
                                {
                                    extend: 'excelHtml5', title: 'Bank Names', autoFilter: true,
                                    exportOptions: {
                                        columns: [0, 1, 2],
                                    }

                                },


                            ],

                        });
                    },
                    error: function (error) {
                        alert('error; ' + eval(error));
                        alert('error; ' + error.responseText);
                    }
                });

                //////////////////////////////


            });
        },
        error: function (error) {
            alert('error; ' + eval(error));
            alert('error; ' + error.responseText);
        }
    });

    return false;
}

function bpd_price_submit() {
    var params = "";
    var AllParamsters = "";
    $("#waitingpanel").modal("show");
    if (chkIds.length > 0) {
        var baseprice = document.getElementById("price_baserate").value;
        for (let i = 0; i < chkIds.length; i++) {
            var parid = chkIds[i];
            var ddlbilingtype = document.getElementById("bpd_billingtype_" + chkIds[i]);
            var bilingtype = ddlbilingtype.options[ddlbilingtype.selectedIndex].value;
            var price = document.getElementById("bpd_price_" + chkIds[i]).value;
            if (price == "")
                price = "0";
            var ddlchargetype = document.getElementById("bpd_chargetype_" + chkIds[i]);
            var chargetype = ddlchargetype.options[ddlchargetype.selectedIndex].value;
            var paramname = document.getElementById("bpd_paramname_" + chkIds[i]).innerHTML;
            params = parid + "~" + bilingtype + "~" + price + "~" + chargetype + "~" + paramname;
            AllParamsters = params + "|" + AllParamsters;

        }
        var ProjectId_par = document.getElementById("price_project_id").innerHTML;
        var ProcessName_par = document.getElementById("price_process_name").innerHTML;
        if (AllParamsters != "") {
            PageMethods.InsertCosting(ProjectId_par, ProcessName_par, baseprice, AllParamsters, bpd_prices_OnSuccess, bpd_price_OnError);
            return false;
        }
        else {
            alert("Please select atleast one parameter.");
            return false;
        }
    }
    else {
        alert("Please select atleast one parameter.");
        return false;
    }
}

function bpd_prices_OnSuccess(result) {
    $("#waitingpanel").modal("hide");
    if (result > 0) {
        document.getElementById("bpd_price_errmsg").innerHTML = "Process/ Deal is configured successfully. Please click <b>OK</b> to redirect to main page.";
        $('#bpd_price_dverror').modal('show');
        return false;
    }
    else {
        document.getElementById("bpd_price_errmsg").innerHTML = "Oops! System is facing connectivity issue. Please try after some time.";
        $('#bpd_price_dverror').modal('show');
        return false;
    }
    return false;
}
function bpd_price_OnError(error) {
    $("#waitingpanel").modal("hide");
    alert(error.responseText);
}

function bpd_price_MessageRedirect() {
    $('#bpd_price_dverror').modal('hide');
    location.href = "ProjectDetails.aspx?ProjectID=" + ProjectID_param;
}


//Billing Header Configuration
function bhconf_BindBillingHeaderConfiguration() {
    $('#load1').show();
    $.ajax({
        url: "BillingHeaderConfiguration.aspx/GetBillingHeaders",
        type: "POST",
        dataType: "json",
        contentType: "application/json; charset=utf-8",

        success: function (data) {
            if ($.fn.dataTable.isDataTable('#bhconf_table')) {
                $('#bhconf_table').DataTable().destroy();
            }
            dataArray = JSON.parse(data.d);
            $('#bhconf_table').DataTable({
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
                    { data: 'IBP_ParameterName' }

                ],

                initComplete: function () {
                    $('#load1').hide();

                },
            });

        }
    });

    return false;
}


function bhconf_submit() {
    var header = document.getElementById("bhconf_name").value;
    if (header == "") {
        alert("Please enter Billing Header");
        return false;
    }
    PageMethods.InsertBillingHeader(header, bhconf_OnSuccess, bhconf_OnError);
    return false;
}

function bhconf_OnSuccess(result) {
    if (result > 0) {
        document.getElementById("bhconf_errmsg").innerHTML = "Billing Header/ Parameter added successfully.";
        $('#bhconf_dverror').modal('show');
        return false;
    }
    else {
        document.getElementById("bhconf_errmsg").innerHTML = "Billing Header/ Parameter already exists.";
        $('#bhconf_dverror').modal('show');
        return false;
    }
    return false;
}
function bhconf_OnError(error) {
    alert(error.responseText);
}

function bhconf_MessageRedirect() {
    $('#bhconf_dverror').modal('hide');
    document.getElementById("bhconf_name").value = "";
    bhconf_BindBillingHeaderConfiguration();
}

//Other Costing

function sacrel_BindProjects() {
    var select = document.getElementById("secrel_project");
    let options = select.getElementsByTagName('option');

    for (var i = options.length; i--;) {
        select.removeChild(options[i]);
    }
    $("#secrel_project").append($("<option></option>").val("").html("Select"));
    $.ajax({
        type: "POST", url: "ProjectDetailsMaster.aspx/GteAllConfiguredProjects", dataType: "json", contentType: "application/json",

        success: function (res) {
            var dataArray = JSON.parse(res.d);
            $.each(dataArray, function (data, value) {
                $("#secrel_project").append($("<option></option>").val(value.PAI_ErpProjectID).html(value.PAI_Project_Name));
            })
        }
    });
}

function secrel_BindOtherCosting() {
    $('#load1').show();
    $.ajax({
        url: "OtherCosting.aspx/GetAllOtherCosting",
        type: "POST",
        dataType: "json",
        contentType: "application/json; charset=utf-8",

        success: function (data) {
            if ($.fn.dataTable.isDataTable('#secrel_table')) {
                $('#secrel_table').DataTable().destroy();
            }
            dataArray = JSON.parse(data.d);
            $('#secrel_table').DataTable({
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
                    { data: 'ProjectName' },
                    { data: 'Rate' },
                    { data: 'Type' },
                    { data: 'AddedByName' },
                    { data: 'AddedDate1' }

                ],

                initComplete: function () {
                    $('#load1').hide();

                },
            });

        }
    });

    return false;
}

function secrel_submit() {
    var ddlproject = document.getElementById("secrel_project");
    var projectid = ddlproject.options[ddlproject.selectedIndex].value;
    if (projectid == "") {
        alert("Please select project.");
        return false;
    }
    var rate = document.getElementById("secrel_rate").value;
    if (rate == "") {
        alert("Please enter rate.");
        return false;
    }
    var ddltype = document.getElementById("secrel_type");
    var type = ddltype.options[ddltype.selectedIndex].value;
    if (type == "") {
        alert("Please enter type.");
        return false;
    }
    PageMethods.InsertOtherRates(projectid, rate, type, secrel_OnSuccess, secrel_OnError);
    return false;
}

function secrel_OnSuccess(result) {
    if (result > 0) {
        document.getElementById("secrel_errmsg").innerHTML = "Rate added successfully.";
        $('#secrel_dverror').modal('show');
        return false;
    }
    else {
        document.getElementById("secrel_errmsg").innerHTML = "Rate already exists.";
        $('#secrel_dverror').modal('show');
        return false;
    }
    return false;
}
function secrel_OnError(error) {
    alert(error.responseText);
}

function secrel_MessageRedirect() {
    $('#secrel_dverror').modal('hide');
    document.getElementById("secrel_project").selectedIndex = 0;
    document.getElementById("secrel_rate").value = "";
    document.getElementById("secrel_type").selectedIndex = 0;
    secrel_BindOtherCosting();
}


//561 Securitization Billing
function secrel_cost_submit() {
    $('#load1').show();

    var parameters = '';

    var phcountrate = document.getElementById("secbill_ph_loancount_rate").value;
    var cccountrate = document.getElementById("secbill_cc_loancount_rate").value;
    var asfcountrate = document.getElementById("secbill_asf_loancount_rate").value;
    var tpolcountrate = document.getElementById("secbill_tpol_loancount_rate").value;
    var modcountrate = document.getElementById("secbill_mod_loancount_rate").value;
    var ficocountrate = document.getElementById("secbill_fico_loancount_rate").value;
    var datacountrate = document.getElementById("secbill_data_loancount_rate").value;
    var mikecountrate = document.getElementById("secbill_mike_loancount_rate").value;
    var relcountrate = document.getElementById("secbill_rel_loancount_rate").value;

    var phhourate = document.getElementById("secbill_ph_hours_rate").value;
    var cchourate = document.getElementById("secbill_cc_hours_rate").value;
    var asfhourate = document.getElementById("secbill_asf_hours_rate").value;
    var tpolhourate = document.getElementById("secbill_tpol_hours_rate").value;
    var modhourate = document.getElementById("secbill_mod_hours_rate").value;
    var ficohourate = document.getElementById("secbill_fico_hours_rate").value;
    var datahourate = document.getElementById("secbill_data_hours_rate").value;
    var mikehourate = document.getElementById("secbill_mike_hours_rate").value;
    var relhourate = document.getElementById("secbill_rel_hours_rate").value;

    parameters = "PH:" + phcountrate + ":" + phhourate;
    parameters = parameters + "|" + "CCs:" + cccountrate + ":" + cchourate;
    parameters = parameters + "|" + "ASF Data Update:" + asfcountrate + ":" + asfhourate;
    parameters = parameters + "|" + "TPOL Pull:" + tpolcountrate + ":" + tpolhourate;
    parameters = parameters + "|" + "MOD Review:" + modcountrate + ":" + modhourate;
    parameters = parameters + "|" + "FICO Pull:" + ficocountrate + ":" + ficohourate;
    parameters = parameters + "|" + "Data Team:" + datacountrate + ":" + datahourate;
    parameters = parameters + "|" + "Mike/Leads (reporting):" + mikecountrate + ":" + mikehourate;
    parameters = parameters + "|" + "Reliance Letter:" + relcountrate + ":" + relhourate;
    PageMethods.InsertUpdateSecuritizationCosting(parameters, secrel_cost_OnSuccess, secrel_cost_OnError);
    return false;
}

function secrel_cost_OnSuccess(result) {
    $('#load1').hide();

    if (result > 0) {
        document.getElementById("secbill_errmsg").innerHTML = "Rate added successfully.";
        $('#secbill_dverror').modal('show');
        return false;
    }
    else {
        document.getElementById("secbill_errmsg").innerHTML = "Rate already exists.";
        $('#secbill_dverror').modal('show');
        return false;
    }
    return false;
}
function secrel_cost_OnError(error) {
    alert(error.responseText);
}

function BindSecuritization561Costing() {
    $('#load1').show();
    $.ajax({
        url: "SecuritizationBilling.aspx/GetSecuritization561Costing",
        type: "POST",
        dataType: "json",
        contentType: "application/json; charset=utf-8",

        success: function (data) {
            var dataArray = JSON.parse(data.d);
            $.each(dataArray, function (index, value) {
                if (blankForNull(value.Description) == "PH") {
                    document.getElementById("secbill_ph_loancount_rate").value = blankForNull(value.RatePerFile);
                    document.getElementById("secbill_ph_hours_rate").value = blankForNull(value.HourlyRate);
                    document.getElementById("secbill_ph_rateperfile").innerHTML = blankForNull(value.RatePerFile);
                    document.getElementById("secbill_ph_hourlyrate").innerHTML = blankForNull(value.HourlyRate);
                }
                if (blankForNull(value.Description) == "CCs") {
                    document.getElementById("secbill_cc_loancount_rate").value = blankForNull(value.RatePerFile);
                    document.getElementById("secbill_cc_hours_rate").value = blankForNull(value.HourlyRate);
                    document.getElementById("secbill_cc_rateperfile").innerHTML = blankForNull(value.RatePerFile);
                    document.getElementById("secbill_cc_hourlyrate").innerHTML = blankForNull(value.HourlyRate);
                }
                if (blankForNull(value.Description) == "ASF Data Update") {
                    document.getElementById("secbill_asf_loancount_rate").value = blankForNull(value.RatePerFile);
                    document.getElementById("secbill_asf_hours_rate").value = blankForNull(value.HourlyRate);
                    document.getElementById("secbill_asf_rateperfile").innerHTML = blankForNull(value.RatePerFile);
                    document.getElementById("secbill_asf_hourlyrate").innerHTML = blankForNull(value.HourlyRate);
                }
                if (blankForNull(value.Description) == "TPOL Pull") {
                    document.getElementById("secbill_tpol_loancount_rate").value = blankForNull(value.RatePerFile);
                    document.getElementById("secbill_tpol_hours_rate").value = blankForNull(value.HourlyRate);
                    document.getElementById("secbill_tpol_rateperfile").innerHTML = blankForNull(value.RatePerFile);
                    document.getElementById("secbill_tpol_hourlyrate").innerHTML = blankForNull(value.HourlyRate);
                }
                if (blankForNull(value.Description) == "MOD Review") {
                    document.getElementById("secbill_mod_loancount_rate").value = blankForNull(value.RatePerFile);
                    document.getElementById("secbill_mod_hours_rate").value = blankForNull(value.HourlyRate);
                    document.getElementById("secbill_mod_rateperfile").innerHTML = blankForNull(value.RatePerFile);
                    document.getElementById("secbill_mod_hourlyrate").innerHTML = blankForNull(value.HourlyRate);
                }
                if (blankForNull(value.Description) == "FICO Pull") {
                    document.getElementById("secbill_fico_loancount_rate").value = blankForNull(value.RatePerFile);
                    document.getElementById("secbill_fico_hours_rate").value = blankForNull(value.HourlyRate);
                    document.getElementById("secbill_fico_rateperfile").innerHTML = blankForNull(value.RatePerFile);
                    document.getElementById("secbill_fico_hourlyrate").innerHTML = blankForNull(value.HourlyRate);
                }
                if (blankForNull(value.Description) == "Data Team") {
                    document.getElementById("secbill_data_loancount_rate").value = blankForNull(value.RatePerFile);
                    document.getElementById("secbill_data_hours_rate").value = blankForNull(value.HourlyRate);
                    document.getElementById("secbill_data_rateperfile").innerHTML = blankForNull(value.RatePerFile);
                    document.getElementById("secbill_data_hourlyrate").innerHTML = blankForNull(value.HourlyRate);
                }
                if (blankForNull(value.Description) == "Mike/Leads (reporting)") {
                    document.getElementById("secbill_mike_loancount_rate").value = blankForNull(value.RatePerFile);
                    document.getElementById("secbill_mike_hours_rate").value = blankForNull(value.HourlyRate);
                    document.getElementById("secbill_mike_rateperfile").innerHTML = blankForNull(value.RatePerFile);
                    document.getElementById("secbill_mike_hourlyrate").innerHTML = blankForNull(value.HourlyRate);
                }
                if (blankForNull(value.Description) == "Reliance Letter") {
                    document.getElementById("secbill_rel_loancount_rate").value = blankForNull(value.RatePerFile);
                    document.getElementById("secbill_rel_hours_rate").value = blankForNull(value.HourlyRate);
                    document.getElementById("secbill_rel_rateperfile").innerHTML = blankForNull(value.RatePerFile);
                    document.getElementById("secbill_rel_hourlyrate").innerHTML = blankForNull(value.HourlyRate);
                }

                if (blankForNull(value.Description) == "Supplementary PH Review") {
                    //document.getElementById("secbill_sph_loancount_rate").value = blankForNull(value.RatePerFile);
                    //document.getElementById("secbill_sph_hours_rate").value = blankForNull(value.HourlyRate);
                    document.getElementById("secbill_sph_rateperfile").innerHTML = blankForNull(value.RatePerFile);
                    document.getElementById("secbill_sph_hourlyrate").innerHTML = blankForNull(value.HourlyRate);
                }

            });
        }
    });
    $('#load1').hide();

    return false;
}

function sec_bill_getTotalAmount_Count(desc) {
    var totalamount = 0;
    var count = document.getElementById("secbill_" + blankForNull(desc) + "_loancount1").value;
    var rateperfile = document.getElementById("secbill_" + blankForNull(desc) + "_rateperfile1").innerHTML;
    if (count != "") {
        if (rateperfile != "" && rateperfile != "0") {
            totalamount = (parseFloat(count) * parseFloat(rateperfile)).toFixed(2);
            document.getElementById("secbill_" + blankForNull(desc) + "_total1").innerHTML = (parseFloat(count) * parseFloat(rateperfile)).toFixed(2);
            sec_bill_calculateTotalAmount();
        }
    }

    var hour = document.getElementById("secbill_" + blankForNull(desc) + "_hours1").value;
    var hourlyrate = document.getElementById("secbill_" + blankForNull(desc) + "_hourlyrate1").innerHTML;
    if (hour != "") {
        if (hourlyrate != "" && hourlyrate != "0") {
            document.getElementById("secbill_" + blankForNull(desc) + "_total1").innerHTML = (parseFloat(totalamount) + parseFloat(hour) * parseFloat(hourlyrate)).toFixed(2);
            sec_bill_calculateTotalAmount();
        }
    }

}

function sec_bill_calculateTotalAmount() {
    $('#load1').show();
    $.ajax({
        url: "SecuritizationBilling.aspx/GetSecuritization561Costing",
        type: "POST",
        dataType: "json",
        contentType: "application/json; charset=utf-8",

        success: function (data) {
            var dataArray = JSON.parse(data.d);
            var total = 0;
            $.each(dataArray, function (index, value) {
                if (blankForNull(value.Description) != "Reliance Letter1") {
                    var rowamount = document.getElementById("secbill_" + blankForNull(value.Description) + "_total1").innerHTML;
                    if (rowamount != "")
                        total = total + parseFloat(rowamount);
                }
                document.getElementById("secbill_totalAll_amount1").innerHTML = parseFloat(total).toFixed(2);
            });

        }
    });
    $('#load1').hide();

    return false;
}

function BindSecuritization561BillingParameters() {
    $('#load1').show();
    $.ajax({
        url: "SecuritizationBilling.aspx/GetSecuritization561Costing",
        type: "POST",
        dataType: "json",
        contentType: "application/json; charset=utf-8",

        success: function (data) {
            var dataArray = JSON.parse(data.d);
            var table = document.getElementById("secbill_table");
            var tbody = document.createElement("tbody");

            $.each(dataArray, function (index, value) {
                if (blankForNull(value.Description) != "Reliance Letter1") {
                    var tr = document.createElement("tr");
                    var td = document.createElement("td");
                    td.style.fontWeight = "bold";
                    td.innerHTML = blankForNull(value.Description);
                    tr.appendChild(td);

                    td = document.createElement("td");
                    td.style.textAlign = "center";
                    var inputloancount = document.createElement("input");
                    inputloancount.setAttribute("id", "secbill_" + blankForNull(value.Description) + "_loancount1");
                    inputloancount.classList.add("form-control");
                    inputloancount.style.width = "100px";
                    inputloancount.style.display = "inline";
                    inputloancount.setAttribute("onchange", "sec_bill_getTotalAmount_Count('" + blankForNull(value.Description) + "')");


                    td.appendChild(inputloancount);
                    tr.appendChild(td);

                    td = document.createElement("td");
                    td.style.textAlign = "center";
                    var inputhourcount = document.createElement("input");
                    inputhourcount.setAttribute("id", "secbill_" + blankForNull(value.Description) + "_hours1");
                    inputhourcount.classList.add("form-control");
                    inputhourcount.style.width = "100px";
                    inputhourcount.style.display = "inline";
                    inputhourcount.setAttribute("onchange", "sec_bill_getTotalAmount_Count('" + blankForNull(value.Description) + "')");
                    td.appendChild(inputhourcount);
                    tr.appendChild(td);

                    td = document.createElement("td");
                    td.style.textAlign = "center";
                    var label = document.createElement("label");
                    label.setAttribute("id", "secbill_" + blankForNull(value.Description) + "_rateperfile1");
                    label.classList.add("form-control");
                    label.style.width = "100px";
                    label.style.display = "inline";
                    label.innerHTML = blankForNull(value.RatePerFile);
                    td.appendChild(label);
                    tr.appendChild(td);

                    td = document.createElement("td");
                    td.style.textAlign = "center";
                    var label = document.createElement("label");
                    label.setAttribute("id", "secbill_" + blankForNull(value.Description) + "_hourlyrate1");
                    label.classList.add("form-control");
                    label.style.width = "100px";
                    label.style.display = "inline";
                    label.innerHTML = blankForNull(value.HourlyRate);
                    td.appendChild(label);
                    tr.appendChild(td);

                    td = document.createElement("td");
                    td.style.textAlign = "center";
                    var label = document.createElement("label");
                    label.setAttribute("id", "secbill_" + blankForNull(value.Description) + "_total1");
                    label.classList.add("form-control");
                    label.style.width = "100px";
                    label.style.display = "inline";
                    td.appendChild(label);
                    tr.appendChild(td);


                    tbody.appendChild(tr);
                }
            });



            var tr = document.createElement("tr");
            var td = document.createElement("td");
            td.style.fontWeight = "bold";
            td.style.fontSize = "14px";
            td.innerHTML = blankForNull("TOTAL");
            tr.appendChild(td);
            td = document.createElement("td");
            td.style.textAlign = "center";
            var label = document.createElement("label");
            label.setAttribute("id", "secbill_totalAll_loancount1");
            label.classList.add("form-control");
            label.style.width = "100px";
            label.style.display = "inline";
            td.appendChild(label);
            tr.appendChild(td);
            td = document.createElement("td");
            td.style.textAlign = "center";
            label = document.createElement("label");
            label.setAttribute("id", "secbill_totalAll_hours1");
            label.classList.add("form-control");
            label.style.width = "100px";
            label.style.display = "inline";
            td.appendChild(label);
            tr.appendChild(td);
            td = document.createElement("td");
            tr.appendChild(td);
            td = document.createElement("td");
            tr.appendChild(td);
            td = document.createElement("td");
            td.style.textAlign = "center";
            var label = document.createElement("label");
            label.setAttribute("id", "secbill_totalAll_amount1");
            label.classList.add("form-control");
            label.style.width = "100px";
            label.style.fontWeight = "bold";
            label.style.fontSize = "13px";
            label.style.color = "green";
            td.appendChild(label);
            tr.appendChild(td);
            tbody.appendChild(tr);


            table.appendChild(tbody);
        }
    });
    $('#load1').hide();

    return false;
}

function secrel_gettotalamount() {
    var phcount = document.getElementById("secbill_ph_loancount").value;
    var cccount = document.getElementById("secbill_cc_loancount").value;
    var asfcount = document.getElementById("secbill_asf_loancount").value;
    var tpolcount = document.getElementById("secbill_tpol_loancount").value;
    var modcount = document.getElementById("secbill_mod_loancount").value;
    var ficocount = document.getElementById("secbill_fico_loancount").value;
    var datacount = document.getElementById("secbill_data_loancount").value;
    var mikecount = document.getElementById("secbill_mike_loancount").value;
    var relcount = document.getElementById("secbill_rel_loancount").value;
    var sphcount = document.getElementById("secbill_sph_loancount").value;
    if (phcount == "") phcount = 0;
    if (cccount == "") cccount = 0;
    if (asfcount == "") asfcount = 0;
    if (tpolcount == "") tpolcount = 0;
    if (modcount == "") modcount = 0;
    if (ficocount == "") ficocount = 0;
    if (datacount == "") datacount = 0;
    if (mikecount == "") mikecount = 0;
    if (relcount == "") relcount = 0;
    if (sphcount == "") sphcount = 0;
    document.getElementById("secbill_total_loancount").innerHTML = (parseInt(phcount) + parseInt(cccount) + parseInt(asfcount) + parseInt(tpolcount)
        + parseInt(modcount) + parseInt(ficocount) + parseInt(datacount) + parseInt(mikecount) + parseInt(sphcount)).toFixed(2);
    if (relcount != "") {
        document.getElementById("secbill_totalAll_loancount").innerHTML = (parseInt(phcount) + parseInt(cccount) + parseInt(asfcount) + parseInt(tpolcount)
            + parseInt(modcount) + parseInt(ficocount) + parseInt(datacount) + parseInt(mikecount) + parseInt(relcount) + parseInt(sphcount)).toFixed(2);
    }

}

function secrel_gettotalhours() {
    var phhours = document.getElementById("secbill_ph_hours").value;
    var cchours = document.getElementById("secbill_cc_hours").value;
    var asfhours = document.getElementById("secbill_asf_hours").value;
    var tpolhours = document.getElementById("secbill_tpol_hours").value;
    var modhours = document.getElementById("secbill_mod_hours").value;
    var ficohours = document.getElementById("secbill_fico_hours").value;
    var datahours = document.getElementById("secbill_data_hours").value;
    var mikehours = document.getElementById("secbill_mike_hours").value;
    var relhours = document.getElementById("secbill_rel_hours").value;
    var sphhours = document.getElementById("secbill_sph_hours").value;
    if (phhours == "") phhours = 0;
    if (cchours == "") cchours = 0;
    if (asfhours == "") asfhours = 0;
    if (tpolhours == "") tpolhours = 0;
    if (modhours == "") modhours = 0;
    if (ficohours == "") ficohours = 0;
    if (datahours == "") datahours = 0;
    if (mikehours == "") mikehours = 0;
    if (relhours == "") relhours = 0;
    if (sphhours == "") sphhours = 0;
    document.getElementById("secbill_total_hours").innerHTML = (parseFloat(phhours) + parseFloat(cchours) + parseFloat(asfhours) + parseFloat(tpolhours)
        + parseFloat(modhours) + parseFloat(ficohours) + parseFloat(datahours) + parseFloat(mikehours) + parseFloat(sphhours)).toFixed(2);
    if (relhours != "") {
        document.getElementById("secbill_totalAll_hours").innerHTML = (parseFloat(phhours) + parseFloat(cchours) + parseFloat(asfhours) + parseFloat(tpolhours)
            + parseFloat(modhours) + parseFloat(ficohours) + parseFloat(datahours) + parseFloat(mikehours) + parseFloat(relhours) + parseFloat(sphhours)).toFixed(2);
    }
}

function secrel_getAllAmount() {
    var phtotalamount = document.getElementById("secbill_ph_total").innerHTML;
    if (phtotalamount == "") phtotalamount = 0;
    var cctotalamount = document.getElementById("secbill_cc_total").innerHTML;
    if (cctotalamount == "") cctotalamount = 0;
    var asftotalamount = document.getElementById("secbill_asf_total").innerHTML;
    if (asftotalamount == "") asftotalamount = 0;
    var tpoltotalamount = document.getElementById("secbill_tpol_total").innerHTML;
    if (tpoltotalamount == "") tpoltotalamount = 0;
    var modtotalamount = document.getElementById("secbill_mod_total").innerHTML;
    if (modtotalamount == "") modtotalamount = 0;
    var ficototalamount = document.getElementById("secbill_fico_total").innerHTML;
    if (ficototalamount == "") ficototalamount = 0;
    var datatotalamount = document.getElementById("secbill_data_total").innerHTML;
    if (datatotalamount == "") datatotalamount = 0;
    var miketotalamount = document.getElementById("secbill_mike_total").innerHTML;
    if (miketotalamount == "") miketotalamount = 0;
    var reltotalamount = document.getElementById("secbill_rel_total").innerHTML;
    if (reltotalamount == "") reltotalamount = 0;
    var sphtotalamount = document.getElementById("secbill_sph_total").innerHTML;
    if (sphtotalamount == "") sphtotalamount = 0;

    document.getElementById("secbill_total_amount").innerHTML = (parseFloat(phtotalamount) + parseFloat(cctotalamount) + parseFloat(asftotalamount)
        + parseFloat(tpoltotalamount)
        + parseFloat(modtotalamount) + parseFloat(ficototalamount) + parseFloat(datatotalamount) + parseFloat(miketotalamount) + parseFloat(sphtotalamount)).toFixed(2);

    if (reltotalamount != "") {
        document.getElementById("secbill_totalAll_amount").innerHTML = (parseFloat(phtotalamount) + parseFloat(cctotalamount) + parseFloat(asftotalamount)
            + parseFloat(tpoltotalamount)
            + parseFloat(modtotalamount) + parseFloat(ficototalamount) + parseFloat(datatotalamount) + parseFloat(miketotalamount) + parseFloat(sphtotalamount)
            + parseFloat(reltotalamount)).toFixed(2);
    }
}

function onphratechange() {
    var phloans = document.getElementById("secbill_ph_loancount").value;
    if (phloans == "") phloans = 0;
    var phloanrate = document.getElementById("secbill_ph_rateperfile").innerHTML;
    if (phloanrate == "") phloanrate = 0;
    var phhours = document.getElementById("secbill_ph_hours").value;
    if (phhours == "") phhours = 0;
    var phhourrate = document.getElementById("secbill_ph_hourlyrate").innerHTML;
    if (phhourrate == "") phhourrate = 0;
    var totalphamount = (parseFloat(phloans) * parseFloat(phloanrate)) + (parseFloat(phhours) * parseFloat(phhourrate))
    document.getElementById("secbill_ph_total").innerHTML = totalphamount.toFixed(2);
    secrel_gettotalamount();
    secrel_gettotalhours();
    secrel_getAllAmount();
}

function onccratechange() {
    var ccloans = document.getElementById("secbill_cc_loancount").value;
    if (ccloans == "") ccloans = 0;
    var ccloanrate = document.getElementById("secbill_cc_rateperfile").innerHTML;
    if (ccloanrate == "") ccloanrate = 0;
    var cchours = document.getElementById("secbill_cc_hours").value;
    if (cchours == "") cchours = 0;
    var cchourrate = document.getElementById("secbill_cc_hourlyrate").innerHTML;
    if (cchourrate == "") cchourrate = 0;
    var totalccamount = (parseFloat(ccloans) * parseFloat(ccloanrate)) + (parseFloat(cchours) * parseFloat(cchourrate))
    document.getElementById("secbill_cc_total").innerHTML = totalccamount.toFixed(2);
    secrel_gettotalamount();
    secrel_gettotalhours();
    secrel_getAllAmount();
}

function onasfratechange() {
    var asfloans = document.getElementById("secbill_asf_loancount").value;
    if (asfloans == "") asfloans = 0;
    var asfloanrate = document.getElementById("secbill_asf_rateperfile").innerHTML;
    if (asfloanrate == "") asfloanrate = 0;
    var asfhours = document.getElementById("secbill_asf_hours").value;
    if (asfhours == "") asfhours = 0;
    var asfhourrate = document.getElementById("secbill_asf_hourlyrate").innerHTML;
    if (asfhourrate == "") asfhourrate = 0;
    var totalasfamount = (parseFloat(asfloans) * parseFloat(asfloanrate)) + (parseFloat(asfhours) * parseFloat(asfhourrate))
    document.getElementById("secbill_asf_total").innerHTML = totalasfamount.toFixed(2);
    secrel_gettotalamount();
    secrel_gettotalhours();
    secrel_getAllAmount();
}

function ontpolratechange() {
    var tpolloans = document.getElementById("secbill_tpol_loancount").value;
    if (tpolloans == "") tpolloans = 0;
    var tpolloanrate = document.getElementById("secbill_tpol_rateperfile").innerHTML;
    if (tpolloanrate == "") tpolloanrate = 0;
    var tpolhours = document.getElementById("secbill_tpol_hours").value;
    if (tpolhours == "") tpolhours = 0;
    var tpolhourrate = document.getElementById("secbill_tpol_hourlyrate").innerHTML;
    if (tpolhourrate == "") tpolhourrate = 0;
    var totaltpolamount = (parseFloat(tpolloans) * parseFloat(tpolloanrate)) + (parseFloat(tpolhours) * parseFloat(tpolhourrate))
    document.getElementById("secbill_tpol_total").innerHTML = totaltpolamount.toFixed(2);
    secrel_gettotalamount();
    secrel_gettotalhours();
    secrel_getAllAmount();
}

function onmodratechange() {
    var modloans = document.getElementById("secbill_mod_loancount").value;
    if (modloans == "") modloans = 0;
    var modloanrate = document.getElementById("secbill_mod_rateperfile").innerHTML;
    if (modloanrate == "") modloanrate = 0;
    var modhours = document.getElementById("secbill_mod_hours").value;
    if (modhours == "") modhours = 0;
    var modhourrate = document.getElementById("secbill_mod_hourlyrate").innerHTML;
    if (modhourrate == "") modhourrate = 0;
    var totalmodamount = (parseFloat(modloans) * parseFloat(modloanrate)) + (parseFloat(modhours) * parseFloat(modhourrate))
    document.getElementById("secbill_mod_total").innerHTML = totalmodamount.toFixed(2);
    secrel_gettotalamount();
    secrel_gettotalhours();
    secrel_getAllAmount();
}

function onficoratechange() {
    var ficoloans = document.getElementById("secbill_fico_loancount").value;
    if (ficoloans == "") ficoloans = 0;
    var ficoloanrate = document.getElementById("secbill_fico_rateperfile").innerHTML;
    if (ficoloanrate == "") ficoloanrate = 0;
    var ficohours = document.getElementById("secbill_fico_hours").value;
    if (ficohours == "") ficohours = 0;
    var ficohourrate = document.getElementById("secbill_fico_hourlyrate").innerHTML;
    if (ficohourrate == "") ficohourrate = 0;
    var totalficoamount = (parseFloat(ficoloans) * parseFloat(ficoloanrate)) + (parseFloat(ficohours) * parseFloat(ficohourrate))
    document.getElementById("secbill_fico_total").innerHTML = totalficoamount.toFixed(2);
    secrel_gettotalamount();
    secrel_gettotalhours();
    secrel_getAllAmount();
}

function ondataratechange() {
    var dataloans = document.getElementById("secbill_data_loancount").value;
    if (dataloans == "") dataloans = 0;
    var dataloanrate = document.getElementById("secbill_data_rateperfile").innerHTML;
    if (dataloanrate == "") dataloanrate = 0;
    var datahours = document.getElementById("secbill_data_hours").value;
    if (datahours == "") datahours = 0;
    var datahourrate = document.getElementById("secbill_data_hourlyrate").innerHTML;
    if (datahourrate == "") datahourrate = 0;
    var totaldataamount = (parseFloat(dataloans) * parseFloat(dataloanrate)) + (parseFloat(datahours) * parseFloat(datahourrate))
    document.getElementById("secbill_data_total").innerHTML = totaldataamount.toFixed(2);
    secrel_gettotalamount();
    secrel_gettotalhours();
    secrel_getAllAmount();
}

function onmikeratechange() {
    var mikeloans = document.getElementById("secbill_mike_loancount").value;
    if (mikeloans == "") mikeloans = 0;
    var mikeloanrate = document.getElementById("secbill_mike_rateperfile").innerHTML;
    if (mikeloanrate == "") mikeloanrate = 0;
    var mikehours = document.getElementById("secbill_mike_hours").value;
    if (mikehours == "") mikehours = 0;
    var mikehourrate = document.getElementById("secbill_mike_hourlyrate").innerHTML;
    if (mikehourrate == "") mikehourrate = 0;
    var totalmikeamount = (parseFloat(mikeloans) * parseFloat(mikeloanrate)) + (parseFloat(mikehours) * parseFloat(mikehourrate))
    document.getElementById("secbill_mike_total").innerHTML = parseFloat(totalmikeamount).toFixed(2);
    secrel_gettotalamount();
    secrel_gettotalhours();
    secrel_getAllAmount();
}

function onsphratechange() {
    var sphloans = document.getElementById("secbill_sph_loancount").value;
    if (sphloans == "") sphloans = 0;
    var sphloanrate = document.getElementById("secbill_sph_rateperfile").innerHTML;
    if (sphloanrate == "") sphloanrate = 0;
    var sphhours = document.getElementById("secbill_sph_hours").value;
    if (sphhours == "") sphhours = 0;
    var sphhourrate = document.getElementById("secbill_sph_hourlyrate").innerHTML;
    if (sphhourrate == "") sphhourrate = 0;
    var totalsphamount = (parseFloat(sphloans) * parseFloat(sphloanrate)) + (parseFloat(sphhours) * parseFloat(sphhourrate))
    document.getElementById("secbill_sph_total").innerHTML = parseFloat(totalsphamount).toFixed(2);
    secrel_gettotalamount();
    secrel_gettotalhours();
    secrel_getAllAmount();
}

function onrelratechange() {
    var relloans = document.getElementById("secbill_rel_loancount").value;
    if (relloans == "") relloans = 0;
    var relloanrate = document.getElementById("secbill_rel_rateperfile").innerHTML;
    if (relloanrate == "") relloanrate = 0;
    var relhours = document.getElementById("secbill_rel_hours").value;
    if (relhours == "") relhours = 0;
    var relhourrate = document.getElementById("secbill_rel_hourlyrate").innerHTML;
    if (relhourrate == "") relhourrate = 0;
    var totalrelamount = (parseFloat(relloans) * parseFloat(relloanrate)) + (parseFloat(relhours) * parseFloat(relhourrate))
    document.getElementById("secbill_rel_total").innerHTML = totalrelamount.toFixed(2);
    secrel_gettotalamount();
    secrel_gettotalhours();
    secrel_getAllAmount();
}

function secbill_bindyear() {
    var start = new Date().getFullYear();

    var select = document.getElementById("secbill_year");
    let options = select.getElementsByTagName('option');

    for (var i = options.length; i--;) {
        select.removeChild(options[i]);
    }

    $("#secbill_year").append($("<option></option>").val("").html("Select"));
    for (var i = start; i > start - 5; i--) {
        $("#secbill_year").append($("<option></option>").val(i).html(i));
    }
}

function secbill_submitbilling() {
    var ddlmonth = document.getElementById("secbill_month");
    var month = ddlmonth.options[ddlmonth.selectedIndex].value;
    var ddlyear = document.getElementById("secbill_year");
    var year = ddlyear.options[ddlyear.selectedIndex].value;

    if (month == "") {
        alert("Please select month"); return false;
    }
    if (year == "") {
        alert("Please select year"); return false;
    }

    var parameters = "";
    var parindv = "";

    var description = document.getElementById("secbill_description").value;
    if (description == "") {
        alert("Please enter description");
        document.getElementById("secbill_description").focus();
        return false;
    }

    var phcount = document.getElementById("secbill_ph_loancount").value;
    var cccount = document.getElementById("secbill_cc_loancount").value;
    var asfcount = document.getElementById("secbill_asf_loancount").value;
    var tpolcount = document.getElementById("secbill_tpol_loancount").value;
    var modcount = document.getElementById("secbill_mod_loancount").value;
    var ficocount = document.getElementById("secbill_fico_loancount").value;
    var datacount = document.getElementById("secbill_data_loancount").value;
    var mikecount = document.getElementById("secbill_mike_loancount").value;
    var relcount = document.getElementById("secbill_rel_loancount").value;
    var sphcount = document.getElementById("secbill_sph_loancount").value;

    var phhours = document.getElementById("secbill_ph_hours").value;
    var cchours = document.getElementById("secbill_cc_hours").value;
    var asfhours = document.getElementById("secbill_asf_hours").value;
    var tpolhours = document.getElementById("secbill_tpol_hours").value;
    var modhours = document.getElementById("secbill_mod_hours").value;
    var ficohours = document.getElementById("secbill_fico_hours").value;
    var datahours = document.getElementById("secbill_data_hours").value;
    var mikehours = document.getElementById("secbill_mike_hours").value;
    var relhours = document.getElementById("secbill_rel_hours").value;
    var sphhours = document.getElementById("secbill_sph_hours").value;

    var phcountrate = document.getElementById("secbill_ph_rateperfile").innerHTML;
    var cccountrate = document.getElementById("secbill_cc_rateperfile").innerHTML;
    var asfcountrate = document.getElementById("secbill_asf_rateperfile").innerHTML;
    var tpolcountrate = document.getElementById("secbill_tpol_rateperfile").innerHTML;
    var modcountrate = document.getElementById("secbill_mod_rateperfile").innerHTML;
    var ficocountrate = document.getElementById("secbill_fico_rateperfile").innerHTML;
    var datacountrate = document.getElementById("secbill_data_rateperfile").innerHTML;
    var mikecountrate = document.getElementById("secbill_mike_rateperfile").innerHTML;
    var relcountrate = document.getElementById("secbill_rel_rateperfile").innerHTML;
    var sphcountrate = document.getElementById("secbill_sph_rateperfile").innerHTML;

    var phhourrate = document.getElementById("secbill_ph_hourlyrate").innerHTML;
    var cchourrate = document.getElementById("secbill_cc_hourlyrate").innerHTML;
    var asfhourrate = document.getElementById("secbill_asf_hourlyrate").innerHTML;
    var tpolhourrate = document.getElementById("secbill_tpol_hourlyrate").innerHTML;
    var modhourrate = document.getElementById("secbill_mod_hourlyrate").innerHTML;
    var ficohourrate = document.getElementById("secbill_fico_hourlyrate").innerHTML;
    var datahourrate = document.getElementById("secbill_data_hourlyrate").innerHTML;
    var mikehourrate = document.getElementById("secbill_mike_hourlyrate").innerHTML;
    var relhourrate = document.getElementById("secbill_rel_hourlyrate").innerHTML;
    var sphhourrate = document.getElementById("secbill_sph_hourlyrate").innerHTML;

    var phtotal = document.getElementById("secbill_ph_total").innerHTML;
    var cctotal = document.getElementById("secbill_cc_total").innerHTML;
    var asftotal = document.getElementById("secbill_asf_total").innerHTML;
    var tpoltotal = document.getElementById("secbill_tpol_total").innerHTML;
    var modtotal = document.getElementById("secbill_mod_total").innerHTML;
    var ficototal = document.getElementById("secbill_fico_total").innerHTML;
    var datatotal = document.getElementById("secbill_data_total").innerHTML;
    var miketotal = document.getElementById("secbill_mike_total").innerHTML;
    var reltotal = document.getElementById("secbill_rel_total").innerHTML;
    var sphtotal = document.getElementById("secbill_sph_total").innerHTML;
    
    if (phtotal != "") {
        parindv = month + ":" + year + ":" + "PH:" + phcount + ":" + phhours + ":" + phcountrate + ":" + phhourrate + ":" + phtotal;
        if (parameters == "")
            parameters = parindv;
        else
            parameters = parameters + "|" + parindv;
    }

    if (cctotal != "") {
        parindv = "";
        parindv = month + ":" + year + ":" + "CCs:" + cccount + ":" + cchours + ":" + cccountrate + ":" + cchourrate + ":" + cctotal;
        if (parameters == "")
            parameters = parindv;
        else
            parameters = parameters + "|" + parindv;
    }
    if (asftotal != "") {
        parindv = "";
        parindv = month + ":" + year + ":" + "ASF Data Update:" + asfcount + ":" + asfhours + ":" + asfcountrate + ":" + asfhourrate + ":" + asftotal;
        if (parameters == "")
            parameters = parindv;
        else
            parameters = parameters + "|" + parindv;
    }
    if (tpoltotal != "") {
        parindv = "";
        parindv = month + ":" + year + ":" + "TPOL Pull:" + tpolcount + ":" + tpolhours + ":" + tpolcountrate + ":" + tpolhourrate + ":" + tpoltotal;
        if (parameters == "")
            parameters = parindv;
        else
            parameters = parameters + "|" + parindv;
    }
    if (modtotal != "") {
        parindv = "";
        parindv = month + ":" + year + ":" + "MOD Review:" + modcount + ":" + modhours + ":" + modcountrate + ":" + modhourrate + ":" + modtotal;
        if (parameters == "")
            parameters = parindv;
        else
            parameters = parameters + "|" + parindv;
    }
    if (ficototal != "") {
        parindv = "";
        parindv = month + ":" + year + ":" + "FICO Pull:" + ficocount + ":" + ficohours + ":" + ficocountrate + ":" + ficohourrate + ":" + ficototal;
        if (parameters == "")
            parameters = parindv;
        else
            parameters = parameters + "|" + parindv;
    }
    if (datatotal != "") {
        parindv = "";
        parindv = month + ":" + year + ":" + "Data Team:" + datacount + ":" + datahours + ":" + datacountrate + ":" + datahourrate + ":" + datatotal;
        if (parameters == "")
            parameters = parindv;
        else
            parameters = parameters + "|" + parindv;
    }
    if (miketotal != "") {
        parindv = "";
        parindv = month + ":" + year + ":" + "Mike/Leads (reporting):" + mikecount + ":" + mikehours + ":" + mikecountrate + ":" + mikehourrate + ":" + miketotal;
        if (parameters == "")
            parameters = parindv;
        else
            parameters = parameters + "|" + parindv;
    }
    if (reltotal != "") {
        parindv = "";
        parindv = month + ":" + year + ":" + "Reliance Letter:" + relcount + ":" + relhours + ":" + relcountrate + ":" + relhourrate + ":" + reltotal;
        if (parameters == "")
            parameters = parindv;
        else
            parameters = parameters + "|" + parindv;
    }
    if (sphtotal != "") {
        parindv = "";
        parindv = month + ":" + year + ":" + "Supplementary PH Review:" + sphcount + ":" + sphhours + ":" + sphcountrate + ":" + sphhourrate + ":" + sphtotal;
        if (parameters == "")
            parameters = parindv;
        else
            parameters = parameters + "|" + parindv;
    }
    if (parameters != "")
        PageMethods.InsertSecuritization561Billing(description, parameters, secbill_submitbill_OnSuccess, secbill_submitbill_OnError);

    return false;
}

function secbill_submitbill_OnSuccess(result) {
    $('#load1').hide();

    if (result > 0) {
        document.getElementById("secbill_errmsg").innerHTML = "Billing sent to Accounts successfully.";
        $('#secbill_dverror').modal('show');
        return false;
    }
    else {
        document.getElementById("secbill_errmsg").innerHTML = "Oops! Error occured while submitting billing to Accounts. Please try after some time.";
        $('#secbill_dverror').modal('show');
        return false;
    }
    return false;
}
function secbill_submitbill_OnError(error) {
    alert(error.responseText);
}


function BindSecuritization561Costing_Revised() {
    $('#load1').show();
    $.ajax({
        url: "SecuritizationBilling.aspx/GetSecuritization561Costing",
        type: "POST",
        dataType: "json",
        contentType: "application/json; charset=utf-8",

        success: function (data) {
            var dataArray = JSON.parse(data.d);
            alert(data.d);
            var maintable = document.getElementById("secbill_table");
                var tbody = document.createElement("tbody");
            $.each(dataArray, function (index, value) {
                var tr = document.createElement("tr");
                var td = document.createElement("td");
                td.innerHTML = blankForNull(value.Description);
                tr.appendChild(td);

                td = document.createElement("td");
                var inputLoans = document.createElement("input");
                inputLoans.classList.add("form-control");
                inputLoans.style.padding("width", "100px");
                inputLoans.attributes.add("type", "number");
                td.appendChild(inputLoans);
                tr.appendChild(td);

                td = document.createElement("td");
                var inputHours = document.createElement("input");
                inputHours.classList.add("form-control");
                inputHours.style.padding("width", "100px");
                inputHours.attributes.add("type", "number");
                td.appendChild(inputHours);
                tr.appendChild(td);
                tbody.appendChild(tr);
                maintable.appendChild(tbody);

                if (blankForNull(value.Description) == "PH") {
                    document.getElementById("secbill_ph_loancount_rate").value = blankForNull(value.RatePerFile);
                    document.getElementById("secbill_ph_hours_rate").value = blankForNull(value.HourlyRate);
                    document.getElementById("secbill_ph_rateperfile").innerHTML = blankForNull(value.RatePerFile);
                    document.getElementById("secbill_ph_hourlyrate").innerHTML = blankForNull(value.HourlyRate);
                }
                if (blankForNull(value.Description) == "CCs") {
                    document.getElementById("secbill_cc_loancount_rate").value = blankForNull(value.RatePerFile);
                    document.getElementById("secbill_cc_hours_rate").value = blankForNull(value.HourlyRate);
                    document.getElementById("secbill_cc_rateperfile").innerHTML = blankForNull(value.RatePerFile);
                    document.getElementById("secbill_cc_hourlyrate").innerHTML = blankForNull(value.HourlyRate);
                }
                if (blankForNull(value.Description) == "ASF Data Update") {
                    document.getElementById("secbill_asf_loancount_rate").value = blankForNull(value.RatePerFile);
                    document.getElementById("secbill_asf_hours_rate").value = blankForNull(value.HourlyRate);
                    document.getElementById("secbill_asf_rateperfile").innerHTML = blankForNull(value.RatePerFile);
                    document.getElementById("secbill_asf_hourlyrate").innerHTML = blankForNull(value.HourlyRate);
                }
                if (blankForNull(value.Description) == "TPOL Pull") {
                    document.getElementById("secbill_tpol_loancount_rate").value = blankForNull(value.RatePerFile);
                    document.getElementById("secbill_tpol_hours_rate").value = blankForNull(value.HourlyRate);
                    document.getElementById("secbill_tpol_rateperfile").innerHTML = blankForNull(value.RatePerFile);
                    document.getElementById("secbill_tpol_hourlyrate").innerHTML = blankForNull(value.HourlyRate);
                }
                if (blankForNull(value.Description) == "MOD Review") {
                    document.getElementById("secbill_mod_loancount_rate").value = blankForNull(value.RatePerFile);
                    document.getElementById("secbill_mod_hours_rate").value = blankForNull(value.HourlyRate);
                    document.getElementById("secbill_mod_rateperfile").innerHTML = blankForNull(value.RatePerFile);
                    document.getElementById("secbill_mod_hourlyrate").innerHTML = blankForNull(value.HourlyRate);
                }
                if (blankForNull(value.Description) == "FICO Pull") {
                    document.getElementById("secbill_fico_loancount_rate").value = blankForNull(value.RatePerFile);
                    document.getElementById("secbill_fico_hours_rate").value = blankForNull(value.HourlyRate);
                    document.getElementById("secbill_fico_rateperfile").innerHTML = blankForNull(value.RatePerFile);
                    document.getElementById("secbill_fico_hourlyrate").innerHTML = blankForNull(value.HourlyRate);
                }
                if (blankForNull(value.Description) == "Data Team") {
                    document.getElementById("secbill_data_loancount_rate").value = blankForNull(value.RatePerFile);
                    document.getElementById("secbill_data_hours_rate").value = blankForNull(value.HourlyRate);
                    document.getElementById("secbill_data_rateperfile").innerHTML = blankForNull(value.RatePerFile);
                    document.getElementById("secbill_data_hourlyrate").innerHTML = blankForNull(value.HourlyRate);
                }
                if (blankForNull(value.Description) == "Mike/Leads (reporting)") {
                    document.getElementById("secbill_mike_loancount_rate").value = blankForNull(value.RatePerFile);
                    document.getElementById("secbill_mike_hours_rate").value = blankForNull(value.HourlyRate);
                    document.getElementById("secbill_mike_rateperfile").innerHTML = blankForNull(value.RatePerFile);
                    document.getElementById("secbill_mike_hourlyrate").innerHTML = blankForNull(value.HourlyRate);
                }
                if (blankForNull(value.Description) == "Reliance Letter") {
                    document.getElementById("secbill_rel_loancount_rate").value = blankForNull(value.RatePerFile);
                    document.getElementById("secbill_rel_hours_rate").value = blankForNull(value.HourlyRate);
                    document.getElementById("secbill_rel_rateperfile").innerHTML = blankForNull(value.RatePerFile);
                    document.getElementById("secbill_rel_hourlyrate").innerHTML = blankForNull(value.HourlyRate);
                }

            });
        }
    });
    $('#load1').hide();

    return false;
}



function BindCostingParametersForRateRevision() {
    $('#load1').show();
    const urlParams = new URLSearchParams(window.location.search);
    const ProcessID = urlParams.get('ProcessID');
    var rate_bpd_price_html = '';
    $.ajax({
        url: "PriceConfiguration.aspx/GetProjectDetailsbyprocessID",
        type: "POST",
        dataType: "json",
        data: "{ProcessID:" + ProcessID + "}",
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            var dataArray = JSON.parse(data.d);//
            $.each(dataArray, function (index, value) {
                var ProjectId = value.ProjectId;
                var ProcessName = value.ProcessName;
                document.getElementById("rate_goback_price").href = "ProjectDetails.aspx?ProjectID=" + ProjectId;
                document.getElementById("rate_price_project_id").innerHTML = ProjectId;
                document.getElementById("rate_recipients").innerHTML = blankForNull(value.EmailList);
                document.getElementById("rate_bpd_header_price").innerHTML = "Billing Parameter and Costing Configuration : " + ProcessName;
                ProjectID_param = ProjectId;
                //////////////////Bind Grid
                $.ajax({
                    url: "RateRevisionConfiguration.aspx/getAllBillingParameters_Rate",
                    type: "POST",
                    dataType: "json",
                    data: "{ProjectID:" + ProjectId + ", ClientProcess:'" + ProcessName + "'}",
                    contentType: "application/json; charset=utf-8",
                    success: function (data1) {
                        var dataArray1 = JSON.parse(data1.d);//

                        $.each(dataArray1, function (index, value1) {
                            var addeddate = eval(value1.IBP_AddedDate1.replace(/\/Date\((\d+)\)\//gi, "new Date($1).toLocaleDateString(\"en-US\")"));

                            rate_bpd_price_html += '<tr>';
                            rate_bpd_price_html += '<td style="text-wrap: nowrap;text-align:center; display:none;">' + blankForNull((index + 1)) + '</td>';
                            if (blankForNull(value1.Exists1) == "Checked") {
                                rate_bpd_price_html += '<td style="text-wrap: nowrap;"><input checked="checked" type="checkbox" id="' + value1.IBP_Id + '" onclick="rate_GetCheckedCheckboxes(this,' + index + ')" /></td>';
                                if (!chkIds.includes(value1.IBP_Id)) {
                                    chkIds.push(value1.IBP_Id);
                                }
                            }
                            else
                                rate_bpd_price_html += '<td style="text-wrap: nowrap;"><input type="checkbox" id="' + value1.IBP_Id + '" onclick="rate_GetCheckedCheckboxes(this,' + index + ')" /></td>';
                            rate_bpd_price_html += '<td style="text-wrap: nowrap;" id="rate_bpd_paramname_' + value1.IBP_Id + '">' + blankForNull(value1.IBP_ParameterName1) + '</td>';
                            rate_bpd_price_html += '<td style="text-wrap: nowrap;"><input class="form-control disabled" type="text" id="rate_bpd_price_' + value1.IBP_Id + '" style="width:100px; height:26px;" value="' + blankForNull(value1.IBV_Remark) + '"/></td>';
                            rate_bpd_price_html += '<td style="text-wrap: nowrap;"><input class="form-control disabled" type="text" id="rate_bpd_price_effectivedate' + value1.IBP_Id + '" style="width:100px; height:26px;" value="' + blankForNull(addeddate) + '"/></td>';
                            rate_bpd_price_html += '<td style="text-wrap: nowrap;"><select class="form-control" id="rate_bpd_revisiontype_' + value1.IBP_Id + '" style="width:150px; height:28px;"><option value="">select</option>';
                            if (blankForNull(value1.RevisionType) == "Half Yearly")
                                rate_bpd_price_html += '<option value="Half Yearly" selected>Half Yearly</option>';
                            else
                                rate_bpd_price_html += '<option value="Half Yearly">Half Yearly</option>';

                            if (blankForNull(value1.RevisionType) == "Yearly")
                                rate_bpd_price_html += '<option value="Yearly" selected>Yearly</option>';
                            else
                                rate_bpd_price_html += '<option value="Yearly">Yearly</option>';
                            rate_bpd_price_html += '</select></td>';
                            rate_bpd_price_html += '<td style="text-wrap: nowrap;"><input class="form-control" type="date" id="rate_bpd_price_date' + value1.IBP_Id + '" style="width:120px; height:26px;" value="' + blankForNull(value1.ReminderDate) + '"/></td>';
                            rate_bpd_price_html += '<td style="text-wrap: nowrap;"><input class="form-control" type="text" id="rate_bpd_price_days' + value1.IBP_Id + '" style="width:100px; height:26px;" value="' + blankForNull(value1.ReminderDays) + '"/></td>';

                            rate_bpd_price_html += '</tr>';
                        });

                        if ($.fn.dataTable.isDataTable('#rate_bpd_price_table')) {
                            bpd_price_table.destroy();
                        }
                        $('#rate_bpd_price_table tbody').html(rate_bpd_price_html);
                        //else
                        bpd_price_table = $('#rate_bpd_price_table').DataTable({
                            dom: 't',
                            scrollX: true,
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

                            buttons: [
                                {
                                    extend: 'excelHtml5', title: 'Bank Names', autoFilter: true,
                                    exportOptions: {
                                        columns: [0, 1, 2],
                                    }

                                },


                            ],

                        });
                    },
                    error: function (error) {
                        alert('error; ' + eval(error));
                        alert('error; ' + error.responseText);
                    }
                });

                //////////////////////////////


            });
        },
        error: function (error) {
            alert('error; ' + eval(error));
            alert('error; ' + error.responseText);
        }
    });

    return false;
}

function rate_updateemails() {
    $("#waitingpanel").modal("show");
    var ProjectId_par = document.getElementById("rate_price_project_id").innerHTML;
    var emaillist = document.getElementById("rate_recipients").value;
    PageMethods.UpdateEmailList(ProjectId_par, emaillist, updateemail_OnSuccess, updateemail_OnError);
    return false;
}

function updateemail_OnSuccess(result) {
    $("#waitingpanel").modal("hide");
    if (result > 0) {
        alert("Emails updated successfully.");
        return false;
    }
    else {
        alert("Oops! System is facing connectivity issue. Please try after some time.");
        return false;
    }
    return false;
}
function updateemail_OnError(error) {
    $("#waitingpanel").modal("hide");
    alert(error.get_message());
}

function rate_updatereminder() {
    var params = "";
    var AllParamsters = "";
    const urlParams = new URLSearchParams(window.location.search);
    const ProcessID = urlParams.get('ProcessID');
    $("#waitingpanel").modal("show");
    if (rate_chkIds.length > 0) {
        for (let i = 0; i < rate_chkIds.length; i++) {
            var parid = rate_chkIds[i];
            var ddlrevisiontype = document.getElementById("rate_bpd_revisiontype_" + rate_chkIds[i]);
            var revisiontype = ddlrevisiontype.options[ddlrevisiontype.selectedIndex].value;
            var price = document.getElementById("rate_bpd_price_" + rate_chkIds[i]).value;
            var effectivedate = document.getElementById("rate_bpd_price_effectivedate" + rate_chkIds[i]).value;
            var reminderdate = document.getElementById("rate_bpd_price_date" + rate_chkIds[i]).value;
            var reminderdate = document.getElementById("rate_bpd_price_date" + rate_chkIds[i]).value;
            var reminderdays = document.getElementById("rate_bpd_price_days" + rate_chkIds[i]).value;
            params = parid + "~" + price + "~" + effectivedate + "~" + revisiontype + "~" + reminderdate + "~" + reminderdays;
            AllParamsters = params + "|" + AllParamsters;
        }
    }
    var ProjectId_par = document.getElementById("rate_price_project_id").innerHTML;
    if (AllParamsters != "") {
        PageMethods.InsertRateRevisionConfiguration(ProjectId_par, ProcessID, AllParamsters, rate_bpd_prices_OnSuccess, rate_bpd_price_OnError);
        return false;
    }
    return false;
}

function rate_bpd_prices_OnSuccess(result) {
    $("#waitingpanel").modal("hide");
    if (result > 0) {
        document.getElementById("rate_bpd_price_errmsg").innerHTML = "Rate revision is configured successfully. Please click <b>OK</b> to redirect to main page.";
        $('#rate_bpd_price_dverror').modal('show');
        return false;
    }
    else {
        document.getElementById("rate_bpd_price_errmsg").innerHTML = "Oops! System is facing connectivity issue. Please try after some time.";
        $('#rate_bpd_price_dverror').modal('show');
        return false;
    }
    return false;
}
function rate_bpd_price_OnError(error) {
    $("#waitingpanel").modal("hide");
    alert(error.responseText);
}

function rate_bpd_price_MessageRedirect() {
    $('#bpd_price_dverror').modal('hide');
    location.href = "ProjectDetails.aspx?ProjectID=" + ProjectID_param;
}
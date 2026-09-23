var cm_initialized = false;
var cm_headerEditId = 0;
var cm_costingEditId = 0;
var cm_subHeaderEditId = 0;

function cm_error(error) {
    $('#load1').hide();
    var message = 'Unable to complete the request.';
    if (error && error.responseJSON && error.responseJSON.Message) {
        message = error.responseJSON.Message;
    } else if (error && error.responseText) {
        message = error.responseText;
    }
    alert(message);
}

function cm_bindYears() {
    var currentYear = new Date().getFullYear();
    var year = $('#cm_year');
    year.empty().append($('<option></option>').val('').text('Select'));
    for (var value = currentYear + 1; value >= currentYear - 10; value--) {
        year.append($('<option></option>').val(value).text(value));
    }
}

function cm_openCostingMaster() {
    if (!cm_initialized) {
        cm_initialized = true;
        cm_bindYears();
        cm_loadHeaders();
        cm_loadProjects();
        cm_loadEntries();
    }
    return true;
}

function cm_loadProjects() {
    $.ajax({
        url: 'CostPerRecordReport.aspx/GetCostingProjects', type: 'POST', dataType: 'json',
        data: '{}', contentType: 'application/json; charset=utf-8',
        success: function (data) {
            var rows = JSON.parse(data.d), list = $('#cm_projectList').empty();
            cm_addProjectOption(list, 'all', 'All Projects', true);
            $.each(rows, function (_, row) {
                var id = row.ProjectID;
                var name = row.ProjectName || row.ProjectName1 || row.Project;
                if (id && name) cm_addProjectOption(list, String(id), String(name), false);
            });
            cm_updateProjectLabel();
        }, error: cm_error
    });
}

function cm_addProjectOption(list, value, text, checked) {
    var label = $('<label/>', { 'class': 'cm-project-option' });
    $('<input/>', { type: 'checkbox', 'class': 'cm-project-check mr-2', value: value })
        .prop('checked', checked).appendTo(label);
    $('<span/>').text(text).appendTo(label);
    list.append(label);
}

function cm_updateProjectLabel() {
    var selected = $('#cm_projectList .cm-project-check:checked');
    var label = 'Select Project(s)';
    if (selected.filter('[value="all"]').length) label = 'All Projects';
    else if (selected.length === 1) label = selected.first().siblings('span').text();
    else if (selected.length > 1) label = selected.length + ' Projects selected';
    $('#cm_projectButton').text(label);
}

function cm_selectedProjects() {
    var values = [];
    $('#cm_projectList .cm-project-check:checked').not('[value="all"]').each(function () {
        values.push(parseInt(this.value, 10));
    });
    return values;
}

$(document).on('click', '#cm_projectButton', function (event) {
    event.stopPropagation();
    $('#cm_projectMenu').toggle();
    if ($('#cm_projectMenu').is(':visible')) $('#cm_projectSearch').focus();
}).on('click', '#cm_projectMenu', function (event) {
    event.stopPropagation();
}).on('change', '.cm-project-check', function () {
    if (this.value === 'all' && this.checked) {
        $('.cm-project-check').not(this).prop('checked', false);
    } else if (this.checked) {
        $('.cm-project-check[value="all"]').prop('checked', false);
    }
    if (!$('#cm_projectList .cm-project-check:checked').length)
        $('.cm-project-check[value="all"]').prop('checked', true);
    cm_updateProjectLabel();
}).on('input', '#cm_projectSearch', function () {
    var term = $.trim($(this).val()).toLowerCase();
    $('#cm_projectList .cm-project-option').each(function () {
        $(this).toggle(!term || $(this).text().toLowerCase().indexOf(term) !== -1);
    });
}).on('click', function () {
    $('#cm_projectMenu').hide();
});

$(document).on('change', '#cm_costAgainst', function () {
    var domain = this.value === 'Domain';
    $('#cm_domainGroup').toggle(domain);
    $('#cm_projectGroup').toggle(this.value === 'Projects');
    if (domain) {
        $('#cm_projectList .cm-project-check').prop('checked', false).filter('[value="all"]').prop('checked', true);
        cm_updateProjectLabel();
    } else $('#cm_domain').val('');
});

function cm_loadHeaders() {
    $('#load1').show();
    $.ajax({
        url: 'CostPerRecordReport.aspx/GetCostingHeaders', type: 'POST', dataType: 'json',
        data: '{}', contentType: 'application/json; charset=utf-8',
        success: function (data) {
            var rows = JSON.parse(data.d);
            var select = $('#cm_costingHeader');
            var parent = $('#cm_subHeaderParent');
            select.empty().append($('<option></option>').val('').text('Select'));
            parent.empty().append($('<option></option>').val('').text('Select'));
            $.each(rows, function (_, row) {
                select.append($('<option></option>').val(row.CostingHeaderID).text(row.HeaderName));
                parent.append($('<option></option>').val(row.CostingHeaderID).text(row.HeaderName));
            });
            if ($.fn.dataTable.isDataTable('#cm_headerTable')) $('#cm_headerTable').DataTable().destroy();
            $('#cm_headerTable').DataTable({
                data: rows, destroy: true, pageLength: 10, order: [],
                columns: [
                    { data: 'CostingHeaderID', title: 'ID' },
                    { data: 'HeaderName', title: 'Costing Header' },
                    { data: 'CreatedBy', title: 'Created By' },
                    { data: 'CreatedOn', title: 'Created On' },
                    { data: null, title: 'Edit', orderable: false, searchable: false, render: function (_, __, row) {
                        return '<button type="button" class="btn btn-sm btn-primary cm-edit-header" data-id="' + row.CostingHeaderID + '">Edit</button>';
                    }}
                ]
            });
            cm_loadSubHeaders(0);
            $('#load1').hide();
        }, error: cm_error
    });
}

function cm_loadSubHeaders(headerId, selectedId) {
    $.ajax({
        url: 'CostPerRecordReport.aspx/GetCostingSubHeaders', type: 'POST', dataType: 'json',
        data: JSON.stringify({ costingHeaderId: headerId || 0 }), contentType: 'application/json; charset=utf-8',
        success: function (data) {
            var rows = JSON.parse(data.d);
            if (headerId) {
                var select = $('#cm_costingSubHeader').empty();
                $.each(rows, function (_, row) { select.append($('<option/>').val(row.CostingSubHeaderID).text(row.SubHeaderName)); });
                $('#cm_subHeaderGroup').toggle(rows.length > 0);
                if (selectedId) select.val(selectedId);
                return;
            }
            if ($.fn.dataTable.isDataTable('#cm_subHeaderTable')) $('#cm_subHeaderTable').DataTable().destroy();
            $('#cm_subHeaderTable').DataTable({ data: rows, destroy: true, pageLength: 10, order: [], columns: [
                { data: 'CostingHeader', title: 'Costing Header' }, { data: 'SubHeaderName', title: 'Sub Header' },
                { data: 'CreatedBy', title: 'Created By' }, { data: 'CreatedOn', title: 'Created On' },
                { data: null, title: 'Edit', orderable: false, searchable: false, render: function () { return '<button type="button" class="btn btn-sm btn-primary cm-edit-subheader">Edit</button>'; } }
            ]});
        }, error: cm_error
    });
}

$(document).on('change', '#cm_costingHeader', function () { cm_loadSubHeaders(parseInt(this.value, 10) || 0); });

function cm_saveSubHeader() {
    var headerId = parseInt($('#cm_subHeaderParent').val(), 10), name = $.trim($('#cm_subHeaderName').val());
    if (!headerId || !name) { alert('Please select a Costing Header and enter a Sub Header.'); return false; }
    $('#load1').show();
    var request = { costingHeaderId: headerId, subHeaderName: name };
    if (cm_subHeaderEditId) request.costingSubHeaderId = cm_subHeaderEditId;
    $.ajax({ url: 'CostPerRecordReport.aspx/' + (cm_subHeaderEditId ? 'UpdateCostingSubHeader' : 'SaveCostingSubHeader'), type: 'POST', dataType: 'json',
        data: JSON.stringify(request), contentType: 'application/json; charset=utf-8', success: function () {
            cm_cancelSubHeaderEdit(); cm_loadSubHeaders(0); $('#load1').hide(); alert('Sub Header saved successfully.');
        }, error: cm_error });
    return false;
}

$(document).on('click', '.cm-edit-subheader', function () {
    var row = $('#cm_subHeaderTable').DataTable().row($(this).closest('tr')).data();
    cm_subHeaderEditId = parseInt(row.CostingSubHeaderID, 10); $('#cm_subHeaderParent').val(row.CostingHeaderID);
    $('#cm_subHeaderName').val(row.SubHeaderName).focus(); $('#cm_subHeaderSave').text('Update'); $('#cm_subHeaderCancel').show();
});

function cm_cancelSubHeaderEdit() {
    cm_subHeaderEditId = 0; $('#cm_subHeaderParent, #cm_subHeaderName').val(''); $('#cm_subHeaderSave').text('Save'); $('#cm_subHeaderCancel').hide(); return false;
}

function cm_saveHeader() {
    var headerName = $.trim($('#cm_headerName').val());
    if (!headerName) {
        alert('Please enter a Costing Header.');
        $('#cm_headerName').focus();
        return false;
    }
    $('#load1').show();
    $.ajax({
        url: 'CostPerRecordReport.aspx/' + (cm_headerEditId ? 'UpdateCostingHeader' : 'SaveCostingHeader'), type: 'POST', dataType: 'json',
        data: JSON.stringify(cm_headerEditId ? { costingHeaderId: cm_headerEditId, headerName: headerName } : { headerName: headerName }), contentType: 'application/json; charset=utf-8',
        success: function () {
            var updated = cm_headerEditId > 0;
            cm_cancelHeaderEdit();
            cm_loadHeaders();
            alert('Costing Header ' + (updated ? 'updated' : 'saved') + ' successfully.');
        }, error: cm_error
    });
    return false;
}

$(document).on('click', '.cm-edit-header', function () {
    var row = $('#cm_headerTable').DataTable().row($(this).closest('tr')).data();
    cm_headerEditId = parseInt(row.CostingHeaderID, 10);
    $('#cm_headerName').val(row.HeaderName).focus();
    $('#cm_headerSave').text('Update');
    $('#cm_headerCancel').show();
});

function cm_cancelHeaderEdit() {
    cm_headerEditId = 0;
    $('#cm_headerName').val('');
    $('#cm_headerSave').text('Save');
    $('#cm_headerCancel').hide();
    return false;
}

function cm_saveCosting() {
    var month = parseInt($('#cm_month').val(), 10);
    var year = parseInt($('#cm_year').val(), 10);
    var costingHeaderId = parseInt($('#cm_costingHeader').val(), 10);
    var domainName = $('#cm_domain').val();
    var costingScope = $('#cm_costAgainst').val();
    var costingSubHeaderId = $('#cm_subHeaderGroup').is(':visible') ? parseInt($('#cm_costingSubHeader').val(), 10) : null;
    var amountText = $.trim($('#cm_amount').val());
    var amount = Number(amountText);
    var appliesToAllProjects = costingScope === 'Domain' || $('#cm_projectList .cm-project-check[value="all"]').prop('checked') === true;
    var projectIds = costingScope === 'Domain' ? [] : cm_selectedProjects();
    if (!month || !year || !costingHeaderId || !costingScope || (costingScope === 'Domain' && !domainName) || ($('#cm_subHeaderGroup').is(':visible') && !costingSubHeaderId) || (costingScope === 'Projects' && !appliesToAllProjects && !projectIds.length) || amountText === '' || isNaN(amount) || amount < 0) {
        alert('Please complete the costing period, header, Cost Against selection and amount.');
        return false;
    }
    $('#load1').show();
    var request = { month: month, year: year, costingHeaderId: costingHeaderId, costingSubHeaderId: costingSubHeaderId, costingScope: costingScope, domainName: domainName, amount: amount,
        appliesToAllProjects: appliesToAllProjects, projectIds: projectIds };
    if (cm_costingEditId) request.costingId = cm_costingEditId;
    $.ajax({
        url: 'CostPerRecordReport.aspx/' + (cm_costingEditId ? 'UpdateCosting' : 'SaveCosting'), type: 'POST', dataType: 'json',
        data: JSON.stringify(request),
        contentType: 'application/json; charset=utf-8',
        success: function () {
            var updated = cm_costingEditId > 0;
            cm_cancelCostingEdit();
            cm_loadEntries();
            alert('Costing ' + (updated ? 'updated' : 'saved') + ' successfully.');
        }, error: cm_error
    });
    return false;
}

function cm_loadEntries() {
    $('#load1').show();
    $.ajax({
        url: 'CostPerRecordReport.aspx/GetCostingEntries', type: 'POST', dataType: 'json',
        data: '{}', contentType: 'application/json; charset=utf-8',
        success: function (data) {
            var rows = JSON.parse(data.d);
            if ($.fn.dataTable.isDataTable('#cm_costingTable')) $('#cm_costingTable').DataTable().destroy();
            $('#cm_costingTable').DataTable({
                data: rows, destroy: true, pageLength: 10, order: [],
                columns: [
                    { data: 'Month', title: 'Month' }, { data: 'Year', title: 'Year' },
                    { data: 'CostingHeader', title: 'Costing Header' },
                    { data: 'SubHeader', title: 'Sub Header', defaultContent: '' },
                    { data: 'CostingScope', title: 'Cost Against', defaultContent: '' },
                    { data: 'DomainName', title: 'Domain', defaultContent: '' },
                    { data: 'Projects', title: 'Project #' },
                    { data: 'Amount', title: 'Amount', render: $.fn.dataTable.render.number(',', '.', 2) },
                    { data: 'CreatedBy', title: 'Created By' }, { data: 'CreatedOn', title: 'Created On' },
                    { data: null, title: 'Edit', orderable: false, searchable: false, render: function () {
                        return '<button type="button" class="btn btn-sm btn-primary cm-edit-costing">Edit</button>';
                    }},
                    { data: 'CostingID', title: 'History', orderable: false, render: function (value) {
                        return '<button type="button" class="btn btn-sm btn-info" onclick="cm_showHistory(' + value + ')">View</button>';
                    }}
                ]
            });
            $('#load1').hide();
        }, error: cm_error
    });
}

$(document).on('click', '.cm-edit-costing', function () {
    var row = $('#cm_costingTable').DataTable().row($(this).closest('tr')).data();
    cm_costingEditId = parseInt(row.CostingID, 10);
    $('#cm_month').val(row.CostingMonth);
    $('#cm_year').val(row.Year);
    $('#cm_costingHeader').val(row.CostingHeaderID);
    $('#cm_domain').val(row.DomainName);
    $('#cm_costAgainst').val(row.CostingScope || (row.DomainName ? 'Domain' : 'Projects')).trigger('change');
    cm_loadSubHeaders(parseInt(row.CostingHeaderID, 10), row.CostingSubHeaderID);
    $('#cm_amount').val(row.Amount);
    $('#cm_projectList .cm-project-check').prop('checked', false);
    if (row.AppliesToAllProjects) {
        $('#cm_projectList .cm-project-check[value="all"]').prop('checked', true);
    } else {
        $.each(String(row.ProjectIDs || '').split(','), function (_, id) {
            $('#cm_projectList .cm-project-check[value="' + id + '"]').prop('checked', true);
        });
    }
    cm_updateProjectLabel();
    $('#cm_costingSave').text('Update');
    $('#cm_costingCancel').show();
    $('#add-costing-tab').tab('show');
    $('#cm_month').focus();
});

function cm_cancelCostingEdit() {
    cm_costingEditId = 0;
    $('#cm_month, #cm_year, #cm_costingHeader, #cm_domain, #cm_costingSubHeader, #cm_costAgainst').val('');
    $('#cm_domainGroup, #cm_projectGroup').hide();
    $('#cm_subHeaderGroup').hide();
    $('#cm_amount, #cm_projectSearch').val('');
    $('#cm_projectList .cm-project-check').prop('checked', false);
    $('#cm_projectList .cm-project-check[value="all"]').prop('checked', true);
    $('#cm_projectList .cm-project-option').show();
    cm_updateProjectLabel();
    $('#cm_costingSave').text('Save');
    $('#cm_costingCancel').hide();
    return false;
}

function cm_showHistory(costingId) {
    $('#load1').show();
    $.ajax({
        url: 'CostPerRecordReport.aspx/GetCostingHistory', type: 'POST', dataType: 'json',
        data: JSON.stringify({ costingId: costingId }), contentType: 'application/json; charset=utf-8',
        success: function (data) {
            var rows = JSON.parse(data.d);
            if ($.fn.dataTable.isDataTable('#cm_historyTable')) $('#cm_historyTable').DataTable().destroy();
            $('#cm_historyTable').DataTable({
                data: rows, destroy: true, paging: false, searching: false, info: false, order: [],
                columns: [
                    { data: 'Action', title: 'Action' }, { data: 'Month', title: 'Month' },
                    { data: 'Year', title: 'Year' }, { data: 'CostingHeader', title: 'Costing Header' },
                    { data: 'SubHeaderName', title: 'Sub Header', defaultContent: '' }, { data: 'CostingScope', title: 'Cost Against', defaultContent: '' }, { data: 'DomainName', title: 'Domain', defaultContent: '' },
                    { data: 'Projects', title: 'Project #' },
                    { data: 'Amount', title: 'Amount', render: $.fn.dataTable.render.number(',', '.', 2) },
                    { data: 'ChangedBy', title: 'Changed By' }, { data: 'ChangedOn', title: 'Changed On' }
                ]
            });
            $('#load1').hide();
            $('#cm_historyModal').modal('show');
        }, error: cm_error
    });
}

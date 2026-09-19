var cm_initialized = false;

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

function cm_loadHeaders() {
    $('#load1').show();
    $.ajax({
        url: 'CostPerRecordReport.aspx/GetCostingHeaders', type: 'POST', dataType: 'json',
        data: '{}', contentType: 'application/json; charset=utf-8',
        success: function (data) {
            var rows = JSON.parse(data.d);
            var select = $('#cm_costingHeader');
            select.empty().append($('<option></option>').val('').text('Select'));
            $.each(rows, function (_, row) {
                select.append($('<option></option>').val(row.CostingHeaderID).text(row.HeaderName));
            });
            if ($.fn.dataTable.isDataTable('#cm_headerTable')) $('#cm_headerTable').DataTable().destroy();
            $('#cm_headerTable').DataTable({
                data: rows, destroy: true, pageLength: 10, order: [],
                columns: [
                    { data: 'CostingHeaderID', title: 'ID' },
                    { data: 'HeaderName', title: 'Costing Header' },
                    { data: 'CreatedBy', title: 'Created By' },
                    { data: 'CreatedOn', title: 'Created On' }
                ]
            });
            $('#load1').hide();
        }, error: cm_error
    });
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
        url: 'CostPerRecordReport.aspx/SaveCostingHeader', type: 'POST', dataType: 'json',
        data: JSON.stringify({ headerName: headerName }), contentType: 'application/json; charset=utf-8',
        success: function () {
            $('#cm_headerName').val('');
            cm_loadHeaders();
            alert('Costing Header saved successfully.');
        }, error: cm_error
    });
    return false;
}

function cm_saveCosting() {
    var month = parseInt($('#cm_month').val(), 10);
    var year = parseInt($('#cm_year').val(), 10);
    var costingHeaderId = parseInt($('#cm_costingHeader').val(), 10);
    var amountText = $.trim($('#cm_amount').val());
    var amount = Number(amountText);
    var appliesToAllProjects = $('#cm_projectList .cm-project-check[value="all"]').prop('checked') === true;
    var projectIds = cm_selectedProjects();
    if (!month || !year || !costingHeaderId || (!appliesToAllProjects && !projectIds.length) || amountText === '' || isNaN(amount) || amount < 0) {
        alert('Please select Month, Year, Costing Header and Project, and enter a valid non-negative Amount.');
        return false;
    }
    $('#load1').show();
    $.ajax({
        url: 'CostPerRecordReport.aspx/SaveCosting', type: 'POST', dataType: 'json',
        data: JSON.stringify({ month: month, year: year, costingHeaderId: costingHeaderId, amount: amount,
            appliesToAllProjects: appliesToAllProjects, projectIds: projectIds }),
        contentType: 'application/json; charset=utf-8',
        success: function () {
            $('#cm_month, #cm_year, #cm_costingHeader').val('');
            $('#cm_amount').val('');
            $('#cm_projectList .cm-project-check').prop('checked', false);
            $('#cm_projectList .cm-project-check[value="all"]').prop('checked', true);
            $('#cm_projectSearch').val('');
            $('#cm_projectList .cm-project-option').show();
            cm_updateProjectLabel();
            cm_loadEntries();
            alert('Costing saved successfully.');
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
                    { data: 'Projects', title: 'Project #' },
                    { data: 'Amount', title: 'Amount', render: $.fn.dataTable.render.number(',', '.', 2) },
                    { data: 'CreatedBy', title: 'Created By' }, { data: 'CreatedOn', title: 'Created On' },
                    { data: 'CostingID', title: 'History', orderable: false, render: function (value) {
                        return '<button type="button" class="btn btn-sm btn-info" onclick="cm_showHistory(' + value + ')">View</button>';
                    }}
                ]
            });
            $('#load1').hide();
        }, error: cm_error
    });
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

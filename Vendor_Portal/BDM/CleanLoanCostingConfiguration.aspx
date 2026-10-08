<%@ Page Title="Clean Loan Costing Configuration" Language="C#" MasterPageFile="~/BDM/BDM.Master" AutoEventWireup="true" CodeBehind="CleanLoanCostingConfiguration.aspx.cs" Inherits="Vendor_Portal.BDM.CleanLoanCostingConfiguration" %>

<asp:Content ID="clc_Head" ContentPlaceHolderID="head" runat="server">
    <link rel="stylesheet" href="../plugins/toastr/toastr.min.css" />
    <style>
        #clc_loading { display:none; position:fixed; inset:0; z-index:99999; background:rgba(15,23,42,.42); }
        #clc_loadingBox { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); padding:24px 32px; border-radius:8px; background:#fff; box-shadow:0 12px 40px rgba(0,0,0,.25); text-align:center; }
        #clc_spinner { width:42px; height:42px; margin:0 auto 12px; border:5px solid #dce7f5; border-top-color:#1687d9; border-radius:50%; animation:clc-spin .8s linear infinite; }
        @keyframes clc-spin { to { transform:rotate(360deg); } }
        .clc-form-card .form-group label { font-size:12px; font-weight:600; color:#334155; }
        .clc-level { min-height:38px; display:flex; align-items:center; gap:22px; }
        .clc-level label { margin:0; font-weight:normal; }
        #clc_table, #clc_table_wrapper, #clc_table_wrapper .row, #clc_table_wrapper .col-sm-12,
        #clc_table_wrapper .dataTables_scroll, #clc_table_wrapper .dataTables_scrollHead,
        #clc_table_wrapper .dataTables_scrollHeadInner, #clc_table_wrapper .dataTables_scrollBody { width:100% !important; }
        #clc_table thead th { background:linear-gradient(to bottom,#cbd0dd 3%,#fff)!important; color:#000; vertical-align:middle; }
        .clc-actions { white-space:nowrap; }
        .clc-actions button { margin-right:5px; }
        @media (max-width:767px) { .clc-level { align-items:flex-start; flex-direction:column; gap:5px; } }
    </style>
    <script src="../plugins/toastr/toastr.min.js"></script>
</asp:Content>

<asp:Content ID="clc_Content" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <div id="clc_loading" role="status" aria-live="polite"><div id="clc_loadingBox"><div id="clc_spinner"></div><strong>One moment, please...</strong></div></div>
    <div class="content-header">
        <div class="container-fluid px-0"><div class="row mb-2 callout callout-info"><div class="col-sm-12"><h6 class="m-0"><i class="fas fa-calculator"></i>&nbsp;&nbsp;<b>Clean Loan Costing Configuration</b></h6></div></div></div>
    </div>

    <div class="card clc-form-card">
        <div class="card-body">
            <input type="hidden" id="clc_costingId" value="0" />
            <div class="form-row align-items-end">
                <div class="form-group col-lg-3 col-md-6">
                    <label for="clc_project">Project <span class="text-danger">*</span></label>
                    <select id="clc_project" class="form-control"><option value="">Select Project</option></select>
                </div>
                <div class="form-group col-lg-3 col-md-6">
                    <label>Costing Level <span class="text-danger">*</span></label>
                    <div class="clc-level">
                        <label><input type="radio" name="clc_costingLevel" id="clc_levelProject" value="Project" checked /> Project Default</label>
                        <label><input type="radio" name="clc_costingLevel" id="clc_levelDeal" value="Deal" /> Deal Exception</label>
                    </div>
                </div>
                <div class="form-group col-lg-3 col-md-6" id="clc_dealGroup" style="display:none;">
                    <label for="clc_deal">Deal # <span class="text-danger">*</span></label>
                    <select id="clc_deal" class="form-control"><option value="">Select Deal</option></select>
                </div>
                <div class="form-group col-lg-3 col-md-6">
                    <label for="clc_rate">Clean Loan Rate <span class="text-danger">*</span></label>
                    <input type="number" id="clc_rate" class="form-control" min="0" step="0.01" inputmode="decimal" placeholder="0.00" />
                </div>
            </div>
            <div class="text-right">
                <button type="button" id="clc_btnSave" class="btn btn-primary"><i class="fas fa-save"></i> Save</button>
                <button type="button" id="clc_btnReset" class="btn btn-secondary"><i class="fas fa-undo"></i> Reset</button>
            </div>
        </div>
    </div>

    <div class="card">
        <div class="card-body w-100">
            <div class="table-responsive w-100">
                <table id="clc_table" class="table table-bordered table-striped w-100">
                    <thead><tr><th>Sr#</th><th>Project</th><th>Costing Level</th><th>Deal #</th><th>Clean Loan Rate</th><th>Added By</th><th>Added Date</th><th>Action</th></tr></thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
    </div>

    <script>
        var clc_table = null, clc_projects = {}, clc_records = [];

        function clc_ajax(method, payload) {
            return $.ajax({ url:'CleanLoanCostingConfiguration.aspx/' + method, type:'POST', data:JSON.stringify(payload || {}), dataType:'json', contentType:'application/json; charset=utf-8' });
        }
        function clc_busy(show) { $('#clc_loading').toggle(show); }
        function clc_error(xhr) { var message='The request could not be completed.'; if(xhr && xhr.responseJSON && xhr.responseJSON.Message) message=xhr.responseJSON.Message; toastr.error(message); }
        function clc_adjust() { if(clc_table) window.setTimeout(function(){ clc_table.columns.adjust(); if(clc_table.responsive) clc_table.responsive.recalc(); }, 0); }
        function clc_date(value) {
            if(!value) return '';
            var match=/Date\((\d+)\)/.exec(value), date=match ? new Date(parseInt(match[1],10)) : new Date(value);
            return isNaN(date.getTime()) ? value : date.toLocaleString('en-IN');
        }
        function clc_escape(value) { return $('<div>').text(value == null ? '' : value).html(); }

        function clc_loadProjects() {
            return clc_ajax('clc_GetProjects').done(function(res){
                var rows=JSON.parse(res.d || '[]'), options='<option value="">Select Project</option>';
                clc_projects={};
                $.each(rows,function(_,row){
                    var id=String(row.PAI_ErpProjectID || ''), name=row.PAI_Project_Name || id;
                    if(id && !clc_projects[id]) { clc_projects[id]=name; options+='<option value="'+clc_escape(id)+'">'+clc_escape(name)+'</option>'; }
                });
                $('#clc_project').html(options);
            });
        }
        function clc_loadDeals(projectId, selectedDeal) {
            $('#clc_deal').html('<option value="">Select Deal</option>');
            if(!projectId) return $.Deferred().resolve().promise();
            return clc_ajax('clc_GetDeals',{projectId:parseInt(projectId,10)}).done(function(res){
                var options='<option value="">Select Deal</option>';
                $.each(JSON.parse(res.d || '[]'),function(_,row){ var deal=row.ProcessName || ''; if(deal) options+='<option value="'+clc_escape(deal)+'">'+clc_escape(deal)+'</option>'; });
                $('#clc_deal').html(options).val(selectedDeal || '');
            });
        }
        function clc_loadRecords() {
            clc_busy(true);
            return clc_ajax('clc_GetRecords').done(function(res){
                clc_records=JSON.parse(res.d || '[]');
                if(clc_table) { clc_table.clear().rows.add(clc_records).draw(); }
                else {
                    clc_table=$('#clc_table').DataTable({
                        data:clc_records, autoWidth:false, responsive:true, ordering:true, pageLength:10,
                        columns:[
                            {data:null,orderable:false,render:function(_,__,___,meta){return meta.row+meta.settings._iDisplayStart+1;}},
                            {data:'ProjectID',render:function(value){return clc_escape(clc_projects[String(value)] || value);}},
                            {data:'DealNo',render:function(value){return value ? 'Deal Exception' : 'Project Default';}},
                            {data:'DealNo',defaultContent:'',render:function(value){return clc_escape(value || '');}},
                            {data:'CleanLoanRate',className:'text-right',render:function(value){return Number(value).toFixed(2);}},
                            {data:'AddedBy',defaultContent:'',render:function(value){return clc_escape(value || '');}},
                            {data:'AddedDate',defaultContent:'',render:function(value){return clc_date(value);}},
                            {data:null,orderable:false,className:'clc-actions',render:function(_,__,row){return '<button type="button" class="btn btn-sm btn-info clc-edit" data-id="'+row.CleanLoanCostingID+'"><i class="fas fa-edit"></i> Edit</button><button type="button" class="btn btn-sm btn-danger clc-delete" data-id="'+row.CleanLoanCostingID+'"><i class="fas fa-trash"></i> Delete</button>';}}
                        ], drawCallback:clc_adjust, initComplete:clc_adjust
                    });
                }
            }).fail(clc_error).always(function(){clc_busy(false);clc_adjust();});
        }
        function clc_toggleLevel() {
            var isDeal=$('input[name="clc_costingLevel"]:checked').val()==='Deal';
            $('#clc_dealGroup').toggle(isDeal); $('#clc_deal').prop('required',isDeal);
            if(!isDeal) $('#clc_deal').val('');
            clc_adjust();
        }
        function clc_reset() {
            $('#clc_costingId').val('0'); $('#clc_project').val(''); $('#clc_levelProject').prop('checked',true);
            $('#clc_rate').val(''); $('#clc_deal').html('<option value="">Select Deal</option>'); $('#clc_btnSave').html('<i class="fas fa-save"></i> Save'); clc_toggleLevel();
        }
        function clc_validate() {
            var level=$('input[name="clc_costingLevel"]:checked').val(), rate=$('#clc_rate').val();
            if(!$('#clc_project').val()) { toastr.warning('Project is mandatory.'); return false; }
            if(level==='Deal' && !$('#clc_deal').val()) { toastr.warning('Deal is mandatory for a Deal Exception.'); return false; }
            if(rate==='' || !isFinite(Number(rate))) { toastr.warning('Clean Loan Rate is mandatory and must be numeric.'); return false; }
            return true;
        }
        function clc_save() {
            if(!clc_validate()) return;
            var payload={cleanLoanCostingId:parseInt($('#clc_costingId').val(),10)||0,projectId:parseInt($('#clc_project').val(),10),costingLevel:$('input[name="clc_costingLevel"]:checked').val(),dealNo:$('#clc_deal').val()||'',cleanLoanRate:$('#clc_rate').val()};
            clc_busy(true);
            clc_ajax('clc_Save',payload).done(function(res){
                if(res.d===1){toastr.success(payload.cleanLoanCostingId ? 'Clean Loan costing updated.' : 'Clean Loan costing saved.');clc_reset();clc_loadRecords();}
                else if(res.d===-1) toastr.warning('A Clean Loan rate already exists for this project and costing level.');
                else toastr.error('The Clean Loan costing could not be saved.');
            }).fail(clc_error).always(function(){clc_busy(false);});
        }
        function clc_edit(id) {
            var row=$.grep(clc_records,function(item){return Number(item.CleanLoanCostingID)===Number(id);})[0]; if(!row) return;
            $('#clc_costingId').val(row.CleanLoanCostingID); $('#clc_project').val(String(row.ProjectID)); $('#clc_rate').val(Number(row.CleanLoanRate).toFixed(2));
            if(row.DealNo){$('#clc_levelDeal').prop('checked',true);clc_toggleLevel();clc_busy(true);clc_loadDeals(row.ProjectID,row.DealNo).fail(clc_error).always(function(){clc_busy(false);});}
            else{$('#clc_levelProject').prop('checked',true);clc_toggleLevel();}
            $('#clc_btnSave').html('<i class="fas fa-save"></i> Update'); window.scrollTo(0,0);
        }
        function clc_delete(id) {
            if(!window.confirm('Delete this Clean Loan costing record?')) return;
            clc_busy(true); clc_ajax('clc_Delete',{cleanLoanCostingId:parseInt(id,10)}).done(function(res){if(res.d===1){toastr.success('Clean Loan costing deleted.');clc_reset();clc_loadRecords();}else toastr.error('The record could not be deleted.');}).fail(clc_error).always(function(){clc_busy(false);});
        }

        $(function(){
            toastr.options={closeButton:true,progressBar:true,positionClass:'toast-top-right'};
            $('input[name="clc_costingLevel"]').on('change',function(){clc_toggleLevel();if(this.value==='Deal')clc_loadDeals($('#clc_project').val()).fail(clc_error);});
            $('#clc_project').on('change',function(){if($('#clc_levelDeal').is(':checked'))clc_loadDeals(this.value).fail(clc_error);});
            $('#clc_btnSave').on('click',clc_save); $('#clc_btnReset').on('click',clc_reset);
            $('#clc_table').on('click','.clc-edit',function(){clc_edit($(this).data('id'));}).on('click','.clc-delete',function(){clc_delete($(this).data('id'));});
            clc_busy(true); clc_loadProjects().done(clc_loadRecords).fail(function(xhr){clc_busy(false);clc_error(xhr);});
            $(window).on('load resize',clc_adjust);
            if(window.ResizeObserver) new ResizeObserver(clc_adjust).observe(document.querySelector('.clc-form-card'));
        });
    </script>
</asp:Content>

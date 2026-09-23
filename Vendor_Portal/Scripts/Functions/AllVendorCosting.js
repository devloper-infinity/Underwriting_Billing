(function ($) {
    'use strict';
    var months=['January','February','March','April','May','June','July','August','September','October','November','December'];
    var metrics=[['USD','US$'],['Volume','Volume'],['Rate','Rate'],['Labour','Labour'],['Total','Total']];
    var domainColumns=['Servicing-561','Servicing-667','Infinity-Credit','Canopy-Credit'];
    var vendorOrder = ['Scienna', 'Compliance', 'LoanLogics', 'LauraMac', 'True Resources', 'Smart Hire', 'LynnHott', 'CoreyDaise', 'LucyBeltran', 'US Payroll (in US$)', 'US Payroll CM (in US$)', 'Total of US Pay roll Expenses US$ (Taxes Incl)', 'US Total Indirect Exp (rent, ins, inern, prof fees, T&E, conf, gifts) AMC lice', 'Magna 5', 'Total of US$ Expenses', 'Group Total Expenses In US$', 'Production + Mgmt salary', 'India Sales salary', 'INDIA Vendor Cost for Domain', 'Total', 'Support Salary', 'Total of India staff Salary as per HRMS', 'Directors & Internal Contracts payments-(manPower Cost)', 'Total cost of HR', 'Electricity', 'Internet', 'Administration & General Expenses', 'Rent','Repairs & Maintenance','Depreciation','Total of India Indirect Expenses','Total of India Expenses (salary + All Indirect exps.','Total India Expenses (In US$) @90'];
    var currentPeriods=null;
    var loadingTimer=null,loadingIndex=0;
    var floatingBody=null,floatingSync=false;
    var loadingSteps=['Calculating Scienna...','Calculating Compliance...','Calculating LoanLogics...','Calculating LauraMac...','Calculating True Resources...','Calculating Smart Hire...','Calculating Remote UW...','Calculating Production and Management salary...','Calculating India Sales salary...','Calculating Support salary...','Calculating HR cost...','Preparing project-wise totals...'];

    function pad(n){return n<10?'0'+n:String(n)}
    function iso(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
    function monthRange(month,year){var m=+month-1,y=+year;return{from:new Date(y,m,1),to:new Date(y,m+1,0)}}
    function formatDate(d){return d.toLocaleDateString('en-US',{month:'short',day:'2-digit',year:'numeric'})}
    function shiftYear(d,offset){var day=d.getDate(),result=new Date(d.getFullYear()+offset,d.getMonth(),1);result.setDate(Math.min(day,new Date(result.getFullYear(),result.getMonth()+1,0).getDate()));return result}
    function selectedLabel(prefix){
        var type=$('#avc_'+prefix+'Type').val();
        if(type==='month')return months[+$('#avc_'+prefix+'Month').val()-1]+' '+$('#avc_'+prefix+'MonthYear').val();
        if(type==='quarter')return 'Q'+$('#avc_'+prefix+'Quarter').val()+' '+$('#avc_'+prefix+'QuarterYear').val();
        return 'YTD through '+months[+$('#avc_'+prefix+'YtdMonth').val()-1]+' '+$('#avc_'+prefix+'YtdYear').val();
    }
    function rangeLabel(value){return formatDate(value.from)+' to '+formatDate(value.to)}

    function range(prefix){
        var type=$('#avc_'+prefix+'Type').val(),result;
        if(type==='month') result=monthRange($('#avc_'+prefix+'Month').val(),$('#avc_'+prefix+'MonthYear').val());
        else if(type==='quarter'){
            var q=+$('#avc_'+prefix+'Quarter').val(),year=+$('#avc_'+prefix+'QuarterYear').val(),startMonth=(q-1)*3;
            result={from:new Date(year,startMonth,1),to:new Date(year,startMonth+3,0)};
        }else if(type==='ytd'){
            var selected=monthRange($('#avc_'+prefix+'YtdMonth').val(),$('#avc_'+prefix+'YtdYear').val());
            result={from:new Date(selected.to.getFullYear(),0,1),to:selected.to};
        }
        if(!result.from||!result.to||isNaN(result.from.getTime())||isNaN(result.to.getTime())||result.from>result.to)throw new Error('Enter a valid '+(prefix==='a'?'Period A':'Period B')+' range.');
        return result;
    }

    function periods(){
        var a=range('a'),mode=$('#avc_comparison').val(),b=null,days,aType=$('#avc_aType').val();
        a.label=selectedLabel('a');
        if(mode==='manual'){b=range('b');b.label=selectedLabel('b')}
        else if(mode==='previous'&&aType==='month'){b=monthRange(a.from.getMonth(),a.from.getFullYear());b.label=months[b.from.getMonth()]+' '+b.from.getFullYear()}
        else if(mode==='previous'&&aType==='quarter'){b={from:new Date(a.from.getFullYear(),a.from.getMonth()-3,1),to:new Date(a.from.getFullYear(),a.from.getMonth(),0)};b.label='Q'+(Math.floor(b.from.getMonth()/3)+1)+' '+b.from.getFullYear()}
        else if(mode==='previous'){days=Math.round((a.to-a.from)/86400000)+1;b={to:new Date(a.from.getFullYear(),a.from.getMonth(),a.from.getDate()-1)};b.from=new Date(b.to.getFullYear(),b.to.getMonth(),b.to.getDate()-days+1);b.label=rangeLabel(b)}
        else if(mode==='previousYear')b={from:shiftYear(a.from,-1),to:shiftYear(a.to,-1)};
        if(b&&!b.label)b.label=aType==='month'?months[b.from.getMonth()]+' '+b.from.getFullYear():aType==='quarter'?'Q'+(Math.floor(b.from.getMonth()/3)+1)+' '+b.from.getFullYear():'YTD through '+months[b.to.getMonth()]+' '+b.to.getFullYear();
        return{a:a,b:b,mode:mode};
    }

    function labels(p){
        $('#avc_periodALabel').text((p.b?'Period A: ':'Selected Period: ')+formatDate(p.a.from)+' to '+formatDate(p.a.to));
        $('#avc_periodBLabel').toggle(!!p.b).text(p.b?'Period B: '+formatDate(p.b.from)+' to '+formatDate(p.b.to):'');
    }

    function message(text,error){$('#avc_message').removeClass('alert-info alert-danger').addClass(error?'alert-danger':'alert-info').text(text).show()}
    function startLoading(details,vendor){clearInterval(loadingTimer);loadingIndex=0;var name=vendor||'Vendor';$('#avc_loadingTitle').text(details?'Loading '+name+' Details':'Preparing All Vendor Costing');$('#avc_loadingText').text(details?'Retrieving '+name+' details...':loadingSteps[0]);$('#avc_loading').addClass('avc-loading-active');if(!details)loadingTimer=setInterval(function(){loadingIndex=(loadingIndex+1)%loadingSteps.length;$('#avc_loadingText').fadeOut(120,function(){$(this).text(loadingSteps[loadingIndex]).fadeIn(120)})},1600)}
    function stopLoading(){clearInterval(loadingTimer);loadingTimer=null;$('#avc_loading').removeClass('avc-loading-active')}
    function addTh(row,text,attrs){var th=$('<th/>').text(text);if(attrs)th.attr(attrs);row.append(th)}
    function number(value,decimals){if(value===null||value===undefined||value==='')return '';return Number(value).toLocaleString('en-US',{minimumFractionDigits:decimals,maximumFractionDigits:decimals})}
    function render(value,type,row,meta){if(value===null||value===undefined)return meta.col&&$(meta.settings.aoColumns[meta.col].nTh).data('pct')?'N/A':'';var decimals=$(meta.settings.aoColumns[meta.col].nTh).data('volume')?0:2;return type==='display'?number(value,decimals):value}
    function detailLink(value,row,project,period,decimals){
        var display=number(value,decimals);if(!currentPeriods||!period||row.Vendor==='Total')return display;
        return $('<a href="#" class="avc-drill"/>').text(display).attr({'data-vendor':row.Vendor||'','data-process':row.Process||'','data-project':project||'','data-period':period}).prop('outerHTML');
    }
    function excelColumn(index){var name='';for(index++;index>0;index=Math.floor((index-1)/26))name=String.fromCharCode(65+(index-1)%26)+name;return name}
    function excelButton(title,groups,frozenColumns,totalColumns){return{extend:'excelHtml5',title:title,
        customizeData:function(data){var second=data.header.slice(0),first=[];$.each(groups,function(_,group){first.push(group.title);for(var i=1;i<group.span;i++)first.push('')});data.header=first;data.body.unshift(second)},
        customize:function(xlsx){
            var sheet=xlsx.xl.worksheets['sheet1.xml'],styles=xlsx.xl['styles.xml'],view=$('sheetViews sheetView',sheet),topLeft=excelColumn(frozenColumns)+'4';
            view.find('pane,selection').remove();view.prepend('<pane xSplit="'+frozenColumns+'" ySplit="3" topLeftCell="'+topLeft+'" activePane="bottomRight" state="frozen"/>');
            var mergeRanges=[],column=0;$.each(groups,function(_,group){var start=excelColumn(column),end=excelColumn(column+group.span-1);if(column<frozenColumns)mergeRanges.push(start+'2:'+start+'3');else if(group.span>1)mergeRanges.push(start+'2:'+end+'2');column+=group.span});
            if(mergeRanges.length){var merges=$('mergeCells',sheet);if(!merges.length){merges=$('<mergeCells/>').insertAfter($('sheetData',sheet))}$.each(mergeRanges,function(_,range){merges.append('<mergeCell ref="'+range+'"/>')});merges.attr('count',$('mergeCell',merges).length)}
            var fills=$('fills',styles),fillId=fills.children('fill').length;fills.append('<fill><patternFill patternType="solid"><fgColor rgb="FFF8D7DA"/><bgColor indexed="64"/></patternFill></fill>').attr('count',fillId+1);
            var cellXfs=$('cellXfs',styles),styleMap={};function redStyle(base){base=parseInt(base||0,10);if(styleMap[base]!==undefined)return styleMap[base];var xf=cellXfs.children('xf').eq(base).clone();xf.attr({fillId:fillId,applyFill:1});styleMap[base]=cellXfs.children('xf').length;cellXfs.append(xf).attr('count',cellXfs.children('xf').length);return styleMap[base]}
            $('sheetData row',sheet).each(function(){var row=$(this),number=parseInt(row.attr('r'),10);if(number<=3)return;var zero=false;$.each(totalColumns,function(_,index){var cell=row.children('c[r="'+excelColumn(index)+number+'"]'),value=$('v',cell).text();if(!cell.length||value===''||Number(value)===0){zero=true;return false}});if(zero)row.children('c').each(function(){var cell=$(this);cell.attr('s',redStyle(cell.attr('s')))})});
        }}
    }
    function orderedRows(rows){
        var found={};$.each(rows,function(_,row){found[$.trim(row.Vendor||'')]=true;row.IsMissing=false});
        $.each(vendorOrder,function(_,vendor){if(!found[vendor])rows.push({Vendor:vendor,Process:'',Project:'',IsMissing:true})});
        rows.sort(function(a,b){var ai=vendorOrder.indexOf(a.Vendor),bi=vendorOrder.indexOf(b.Vendor);ai=ai<0?999:ai;bi=bi<0?999:bi;return ai-bi||(a.Vendor||'').localeCompare(b.Vendor||'')||(a.Process||'').localeCompare(b.Process||'')});return rows;
    }
    function hasZeroTotal(row,compare){
        return Number(row.PeriodA_Total||0)===0||(compare&&Number(row.PeriodB_Total||0)===0);
    }
    function syncWidths(table,widths){
        var wrapper=table.closest('.dataTables_wrapper'),total=0;$.each(widths,function(_,width){total+=width});
        wrapper.find('.dataTables_scrollHeadInner').css('width',total+'px');
        wrapper.find('.dataTables_scrollHead table,.dataTables_scrollBody table,.dataTables_scrollFoot table').each(function(){
            var current=$(this),group=current.children('colgroup'),cols;
            if(!group.length){group=$('<colgroup/>').prependTo(current);for(var i=0;i<widths.length;i++)group.append('<col>')}
            cols=group.children('col');current.css({width:total+'px','min-width':total+'px','table-layout':'fixed'});
            $.each(widths,function(index,width){cols.eq(index).css({width:width+'px','min-width':width+'px','max-width':width+'px'})});
        });
    }
    function updateFloatingScroll(){
        var wrapper=$('.tab-pane.active .dataTables_wrapper:visible'),body=wrapper.find('.dataTables_scrollBody').first(),bar=$('#avc_floatingScroll');
        if(!body.length){bar.hide();floatingBody=null;return}
        var node=body[0],rect=node.getBoundingClientRect(),head=wrapper.find('.dataTables_scrollHead')[0],headTop=head?head.getBoundingClientRect().top:rect.top;
        if(node.scrollWidth<=node.clientWidth||headTop>1||rect.bottom<=window.innerHeight){bar.hide();floatingBody=null;return}
        floatingBody=body;bar.css({display:'block',left:rect.left+'px',width:rect.width+'px'}).children().width(node.scrollWidth);
        if(!floatingSync){floatingSync=true;bar.scrollLeft(node.scrollLeft);floatingSync=false}
    }
    function syncVisibleTables(){$.fn.dataTable.tables({visible:true,api:true}).columns.adjust();$('#avc_summary,#avc_detail').each(function(){var table=$(this),widths=table.data('avc-widths');if(widths)syncWidths(table,widths)});updateFloatingScroll()}

    function columns(detail,compare){
        var list=[{key:'Vendor',title:'Vendor'}];
        if(detail)list.push({key:'Process',title:'ERP Process'},{key:'Project',title:'Project'});
        $.each(metrics,function(_,m){list.push({key:'PeriodA_'+m[0],title:m[1],group:'Period A',metric:m[0]})});
        if(compare){
            $.each(metrics,function(_,m){list.push({key:'PeriodB_'+m[0],title:m[1],group:'Period B',metric:m[0]})});
            $.each(metrics,function(_,m){list.push({key:'Difference_'+m[0],title:m[1],group:'Difference',metric:m[0]})});
            $.each(metrics,function(_,m){list.push({key:'DifferencePct_'+m[0],title:m[1],group:'Difference %',metric:m[0],pct:true})});
        }
        return list;
    }

    function buildTable(selector,rows,detail,compare,title,periodAName,periodBName){
        var table=$(selector),defs=columns(detail,compare);
        if($.fn.dataTable.isDataTable(table))table.DataTable().destroy();table.empty();
        var head=$('<thead/>'),r1=$('<tr/>'),r2=$('<tr/>'),fixed=detail?3:1;
        for(var i=0;i<fixed;i++)addTh(r1,defs[i].title,{rowspan:2});
        addTh(r1,periodAName,{colspan:5});if(compare){addTh(r1,periodBName,{colspan:5});addTh(r1,'Difference',{colspan:5});addTh(r1,'Difference %',{colspan:5})}
        for(i=fixed;i<defs.length;i++){var th=$('<th/>').text(defs[i].title).data('pct',defs[i].pct===true).data('volume',defs[i].metric==='Volume');r2.append(th)}
        var foot=$('<tfoot/>'),fr=$('<tr/>');for(i=0;i<defs.length;i++)fr.append($('<th/>'));
        table.append(head.append(r1,r2)).append($('<tbody/>')).append(foot.append(fr));
        var dtCols=[],widths=[],groups=[],totalColumns=[];for(var g=0;g<fixed;g++)groups.push({title:defs[g].title,span:1});groups.push({title:periodAName,span:5});if(compare){groups.push({title:periodBName,span:5},{title:'Difference',span:5},{title:'Difference %',span:5})}$.each(defs,function(index,d){var width=d.key==='Vendor'?180:d.key==='Process'?240:d.key==='Project'?130:100;if(d.key==='PeriodA_Total'||d.key==='PeriodB_Total')totalColumns.push(index);widths.push(width);dtCols.push({data:d.key,defaultContent:'',width:width+'px',render:d.key==='Vendor'||d.key==='Process'||d.key==='Project'?$.fn.dataTable.render.text():function(value,type,row,meta){var output=render(value,type,row,meta),period=d.key.indexOf('PeriodA_')===0?'a':d.key.indexOf('PeriodB_')===0?'b':null;return type==='display'&&period?detailLink(value,row,'',period,d.metric==='Volume'?0:2):output}})});table.data('avc-widths',widths);
        table.DataTable({data:rows||[],columns:dtCols,autoWidth:false,scrollX:true,scrollCollapse:true,pageLength:50,ordering:true,order:[],dom:'Bfrtip',buttons:[excelButton(title,groups,fixed,totalColumns)],language:{emptyTable:'No data found for the selected period.'},rowCallback:function(row,data){$(row).toggleClass('avc-zero-total',hasZeroTotal(data,compare))},drawCallback:function(){syncWidths(table,widths)},footerCallback:function(){
            var api=this.api();$(api.column(0).footer()).text('Total');
            $.each(defs,function(index,d){if(index<fixed||d.metric==='Rate'||d.pct)return;var total=api.column(index,{search:'applied'}).data().reduce(function(a,b){return Number(a||0)+Number(b||0)},0);$(api.column(index).footer()).text(number(total,d.metric==='Volume'?0:2))});
        }});
    }

    function matrixMetrics(compare,aLabel,bLabel,includeLabour){
        var result=[];
        var selected=$.grep(metrics,function(m){return includeLabour||(m[0]!=='Labour'&&m[0]!=='Total')});
        $.each(selected,function(_,m){result.push({key:'PeriodA_'+m[0],title:m[1],metric:m[0]})});
        if(compare){
            $.each(selected,function(_,m){result.push({key:'PeriodB_'+m[0],title:bLabel+' '+m[1],metric:m[0]})});
            $.each(selected,function(_,m){result.push({key:'Difference_'+m[0],title:'Difference '+m[1],metric:m[0]})});
            $.each(selected,function(_,m){result.push({key:'DifferencePct_'+m[0],title:'Difference % '+m[1],metric:m[0],pct:true})});
            $.each(result.slice(0,selected.length),function(_,m){m.title=aLabel+' '+m.title});
        }
        return result;
    }

    function buildMatrix(rows,compare,periodAName,periodBName){
        var table=$('#avc_detail'),projects=[],projectSeen={},rowMap={},matrix=[],totalDefs=matrixMetrics(compare,periodAName,periodBName,true),projectDefs=matrixMetrics(compare,periodAName,periodBName,false);
        $.each(rows||[],function(_,source){
            var project=$.trim(source.Project||''),rowKey=(source.Vendor||'')+'\u001f'+(source.Process||'');
            if(project&&domainColumns.indexOf(project)<0&&!projectSeen[project]){projectSeen[project]=true;projects.push(project)}
            if(!rowMap[rowKey]){rowMap[rowKey]={Vendor:source.Vendor||'',Process:source.Process||'',projects:{},total:{},IsMissing:source.IsMissing===true};matrix.push(rowMap[rowKey])}
            var target=rowMap[rowKey];if(project)target.projects[project]=source;
            $.each(totalDefs,function(_,m){if(!m.pct)target.total[m.key]=Number(target.total[m.key]||0)+Number(source[m.key]||0)});
        });
        projects.sort(function(a,b){return a.localeCompare(b,undefined,{numeric:true})});
        $.each(matrix,function(_,row){
            $.each(['PeriodA','PeriodB','Difference'],function(_,prefix){
                if(row.total[prefix+'_Volume'])row.total[prefix+'_Rate']=row.total[prefix+'_USD']/row.total[prefix+'_Volume'];
            });
            if(compare)$.each(metrics,function(_,m){var b=row.total['PeriodB_'+m[0]],d=row.total['Difference_'+m[0]];row.total['DifferencePct_'+m[0]]=b?d*100/Math.abs(b):null});
        });
        function domainSource(row,domain){
            var source={},keys=[];
            $.each(Object.keys(row.projects),function(_,key){
                var normalized=$.trim(key).toLowerCase();
                if(key===domain||(domain==='Servicing-561'&&normalized==='561')||(domain==='Servicing-667'&&normalized==='667')||
                    (domain==='Infinity-Credit'&&domainColumns.indexOf(key)<0&&normalized!=='561'&&normalized!=='667'&&normalized!=='record not found'&&normalized!=='training'))keys.push(key);
            });
            if(domain==='Canopy-Credit')keys=$.grep(keys,function(key){return key==='Canopy-Credit'});
            $.each(keys,function(_,key){var item=row.projects[key];$.each(item,function(name,value){if(/^(PeriodA|PeriodB|Difference)_(USD|Volume|Labour|Total)$/.test(name))source[name]=Number(source[name]||0)+Number(value||0)})});
            $.each(['PeriodA','PeriodB'],function(_,prefix){var volume=source[prefix+'_Volume']||0;source[prefix+'_Rate']=volume?(source[prefix+'_USD']||0)/volume:0});
            source.Difference_Rate=(source.PeriodA_Rate||0)-(source.PeriodB_Rate||0);
            if(compare)$.each(metrics,function(_,metric){var b=source['PeriodB_'+metric[0]],d=source['Difference_'+metric[0]];source['DifferencePct_'+metric[0]]=b?d*100/Math.abs(b):null});
            return source;
        }
        $.each(matrix,function(_,row){row.domains={};$.each(domainColumns,function(_,domain){row.domains[domain]=domainSource(row,domain)})});
        if($.fn.dataTable.isDataTable(table))table.DataTable().destroy();table.empty();
        var head=$('<thead/>'),r1=$('<tr/>'),r2=$('<tr/>');addTh(r1,'Vendor',{rowspan:2});addTh(r1,'ERP Process',{rowspan:2});
        addTh(r1,periodAName,{colspan:totalDefs.length});$.each(totalDefs,function(_,m){addTh(r2,m.title)});
        $.each(domainColumns,function(_,domain){addTh(r1,domain,{colspan:projectDefs.length});$.each(projectDefs,function(_,m){addTh(r2,m.title)})});
        $.each(projects,function(_,project){addTh(r1,'Project # '+project,{colspan:projectDefs.length});$.each(projectDefs,function(_,m){addTh(r2,m.title)})});
        var foot=$('<tfoot/>'),fr=$('<tr/>'),columnCount=2+totalDefs.length+projectDefs.length*(domainColumns.length+projects.length);for(var i=0;i<columnCount;i++)fr.append($('<th/>'));table.append(head.append(r1,r2)).append($('<tbody/>')).append(foot.append(fr));
        var cols=[{data:'Vendor',width:'180px',render:$.fn.dataTable.render.text()},{data:'Process',width:'260px',render:$.fn.dataTable.render.text()}],widths=[180,260];
        function metricColumn(project,m){return{data:null,defaultContent:'',width:'110px',metric:m.metric,pct:m.pct===true,render:function(_,type,row){var source=project?(domainColumns.indexOf(project)>=0?row.domains[project]:row.projects[project]):row.total,value=source?source[m.key]:null;if(value===null||value===undefined)return m.pct?'N/A':'';var period=m.key.indexOf('PeriodA_')===0?'a':m.key.indexOf('PeriodB_')===0?'b':null;return type==='display'&&period?detailLink(value,row,project,period,m.metric==='Volume'?0:2):type==='display'?number(value,m.metric==='Volume'?0:2):value}}}
        $.each(totalDefs,function(_,m){cols.push(metricColumn('',m));widths.push(110)});$.each(domainColumns,function(_,domain){$.each(projectDefs,function(_,m){cols.push(metricColumn(domain,m));widths.push(110)})});$.each(projects,function(_,project){$.each(projectDefs,function(_,m){cols.push(metricColumn(project,m));widths.push(110)})});table.data('avc-widths',widths);
        var exportGroups=[{title:'Vendor',span:1},{title:'ERP Process',span:1},{title:periodAName,span:totalDefs.length}],exportTotalColumns=[];$.each(totalDefs,function(index,m){if(m.key==='PeriodA_Total'||m.key==='PeriodB_Total')exportTotalColumns.push(2+index)});$.each(domainColumns,function(_,domain){exportGroups.push({title:domain,span:projectDefs.length})});$.each(projects,function(_,project){exportGroups.push({title:'Project # '+project,span:projectDefs.length})});
        table.DataTable({data:matrix,columns:cols,autoWidth:false,scrollX:true,scrollCollapse:true,fixedColumns:{leftColumns:2},pageLength:50,ordering:true,order:[],dom:'Bfrtip',buttons:[excelButton('All Vendor Costing - Project-wise Report',exportGroups,2,exportTotalColumns)],language:{emptyTable:'No data found for the selected period.'},rowCallback:function(row,data){$(row).toggleClass('avc-zero-total',hasZeroTotal({IsMissing:data.IsMissing,PeriodA_Total:data.total.PeriodA_Total,PeriodB_Total:data.total.PeriodB_Total},compare))},drawCallback:function(){syncWidths(table,widths);setTimeout(updateFloatingScroll,0)},footerCallback:function(){
            var api=this.api();$(api.column(0).footer()).text('Total');
            for(var index=2;index<cols.length;index++){var definition=cols[index];if(definition.metric==='Rate'||definition.pct)continue;var total=matrix.reduce(function(sum,row){return sum+Number(definition.render(null,'sort',row)||0)},0);$(api.column(index).footer()).text(number(total,definition.metric==='Volume'?0:2))}
        }});
    }

    function search(){
        $('#avc_message').hide();var p;try{p=periods();labels(p);currentPeriods=p}catch(e){message(e.message,true);return}
        startLoading(false);$('#avc_search').prop('disabled',true);
        $.ajax({url:'AllVendorCosting.aspx/GetReport',type:'POST',dataType:'json',contentType:'application/json; charset=utf-8',data:JSON.stringify({periodAFrom:iso(p.a.from),periodATo:iso(p.a.to),periodBFrom:p.b?iso(p.b.from):null,periodBTo:p.b?iso(p.b.to):null})})
        .done(function(response){var data=JSON.parse(response.d),compare=!!p.b,aName=p.a.label,bName=compare?p.b.label:'';orderedRows(data.Detail);orderedRows(data.Summary);buildMatrix(data.Detail,compare,aName,bName);buildTable('#avc_summary',data.Summary,false,compare,'All Vendor Costing - Management Summary',aName,bName);setTimeout(syncVisibleTables,0)})
        .fail(function(xhr){message(xhr.responseJSON&&xhr.responseJSON.Message?xhr.responseJSON.Message:'Unable to load the report.',true)})
        .always(function(){stopLoading();$('#avc_search').prop('disabled',false)});
    }

    function showControls(prefix){var type=$('#avc_'+prefix+'Type').val();$('.avc-control[data-period="'+prefix+'"]').hide().filter('[data-type="'+type+'"]').show()}
    function comparisonChanged(){var manual=$('#avc_comparison').val()==='manual';$('#avc_periodB').toggle(manual);try{labels(periods())}catch(e){}}
    function showInvoiceDetails(link){
        var item=$(link).data(),period=item.period==='b'?currentPeriods.b:currentPeriods.a;if(!period)return;
        $('#avc_invoiceTitle').text(item.vendor+(item.project?' - '+(domainColumns.indexOf(item.project)>=0?'':'Project # ')+item.project:'')+' - '+period.label);
        $('#avc_invoiceModal').modal('show');startLoading(true,item.vendor);
        $.ajax({url:'AllVendorCosting.aspx/GetInvoiceDetails',type:'POST',dataType:'json',contentType:'application/json; charset=utf-8',data:JSON.stringify({vendor:item.vendor,project:item.project||'',process:item.process||'',fromDate:iso(period.from),toDate:iso(period.to)})})
        .done(function(response){var rows=JSON.parse(response.d),table=$('#avc_invoiceTable');if($.fn.dataTable.isDataTable(table))table.DataTable().destroy();table.empty();var grouped=rows.some(function(r){return $.trim(r.SubHeader||'')!==''}),keys=rows.length?Object.keys(rows[0]).filter(function(k){return !grouped||k!=='SubHeader'}):[],head=$('<tr/>'),cols=[];if(grouped)rows.sort(function(a,b){return String(a.SubHeader||'').localeCompare(String(b.SubHeader||''))});$.each(keys,function(_,key){head.append($('<th/>').text(key.replace(/([a-z])([A-Z])/g,'$1 $2')));cols.push({data:key,defaultContent:'',render:$.fn.dataTable.render.text()})});table.append($('<thead/>').append(head)).append('<tbody/>');table.DataTable({data:rows,columns:cols,scrollX:true,scrollY:'calc(100vh - 265px)',scrollCollapse:true,pageLength:25,dom:'Bfrtip',buttons:[{extend:'excelHtml5',title:$('#avc_invoiceTitle').text()}],language:{emptyTable:'No invoice details found.'},drawCallback:function(){if(!grouped)return;var api=this.api(),last=null;api.rows({page:'current'}).every(function(){var row=this.data(),name=row.SubHeader||'No Sub Header';if(name!==last)$(this.node()).before('<tr class="avc-subheader-group"><td colspan="'+keys.length+'"></td></tr>').prev().find('td').text(name);last=name})}})})
        .fail(function(xhr){message(xhr.responseJSON&&xhr.responseJSON.Message?xhr.responseJSON.Message:'Unable to load invoice details.',true);$('#avc_invoiceModal').modal('hide')})
        .always(stopLoading);
    }
    $(function(){
        $('#avc_loading').appendTo(document.body);
        var now=new Date();$.each(months,function(i,m){$('.avc-month').append($('<option/>').val(i+1).text(m))});
        for(var y=now.getFullYear()+1;y>=now.getFullYear()-10;y--)$('.avc-year').append($('<option/>').val(y).text(y));
        $('#avc_aMonth,#avc_aYtdMonth').val(now.getMonth()+1);var previous=new Date(now.getFullYear(),now.getMonth()-1,1);$('#avc_bMonth,#avc_bYtdMonth').val(previous.getMonth()+1);
        $('#avc_aMonthYear,#avc_aYtdYear,#avc_aQuarterYear').val(now.getFullYear());$('#avc_bMonthYear,#avc_bYtdYear,#avc_bQuarterYear').val(previous.getFullYear());
        $('.avc-type').on('change',function(){showControls(this.id.indexOf('_a')>-1?'a':'b');comparisonChanged()});$('#avc_comparison').on('change',comparisonChanged);$('#avc_search').on('click',search);
        $('a[data-toggle="pill"]').on('shown.bs.tab',function(){setTimeout(syncVisibleTables,0)});
        $(window).on('scroll resize',updateFloatingScroll);
        $('#avc_floatingScroll').on('scroll',function(){if(floatingSync||!floatingBody)return;floatingSync=true;floatingBody.scrollLeft(this.scrollLeft);floatingSync=false});
        $(document).on('scroll','.dataTables_scrollBody',function(){if(floatingSync||!floatingBody||this!==floatingBody[0])return;floatingSync=true;$('#avc_floatingScroll').scrollLeft(this.scrollLeft);floatingSync=false});
        $(document).on('click','.avc-drill',function(e){e.preventDefault();showInvoiceDetails(this)});
        showControls('a');showControls('b');comparisonChanged();
    });
}(jQuery));

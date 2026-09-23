IF OBJECT_ID(N'dbo.ufn_SafeNumeric',N'FN') IS NULL
    EXEC(N'CREATE FUNCTION dbo.ufn_SafeNumeric(@Value NVARCHAR(4000)) RETURNS DECIMAL(38,10) AS BEGIN RETURN 0 END');
GO

ALTER FUNCTION dbo.ufn_SafeNumeric(@Value NVARCHAR(4000))
RETURNS DECIMAL(38,10)
AS
BEGIN
    DECLARE @Clean NVARCHAR(4000)=LTRIM(RTRIM(REPLACE(REPLACE(@Value,N',',N''),N'$',N'')));
    IF @Clean IS NULL OR @Clean=N'' OR @Clean IN (N'-',N'.')
       OR @Clean LIKE N'%[^0-9.-]%'
       OR LEN(@Clean)-LEN(REPLACE(@Clean,N'.',N''))>1
       OR CHARINDEX(N'-',SUBSTRING(@Clean,2,LEN(@Clean)))>0 RETURN 0;
    RETURN CONVERT(DECIMAL(38,10),@Clean);
END;
GO

ALTER PROCEDURE [GetCostPerRecordReport_NewERP_VendorReport] --'July','2026'
@Month nvarchar(100), @Year nvarchar(100), @OutputMode nvarchar(20)=NULL,
@CostingVendor nvarchar(100)=NULL,@CostingProject nvarchar(200)=NULL          
as          
begin          
SET NOCOUNT ON;
declare @FromDate nvarchar(100), @ToDate nvarchar(100)          
--set @Month='January' set @Year='2025'          
declare @From nvarchar(100)                      
set @From='1-'+LEFT(@Month,3)+'-'+CAST(@Year as nvarchar(100))                     
declare @Condition nvarchar(100)          
set @Condition = '%-'+left(@Month,3)+'-'+cast(@Year as NVARCHAR(100))          
      --[192.168.12.22,8989].    
select * into #BillingData from (          
select ProjectID, ProjectNumber, InvoiceNumber, BillingPeriod,Invoice_OrderCount, Invoice_Amount  from InfinityBilling.dbo.InfinityBilling_InvoiceMaster where BillingPeriod like @Condition          
union all          
select ProjectID, ProjectNumber, InvoiceNumber, BillingPeriod,Invoice_OrderCount, Invoice_Amount  from InfinityBilling_UW.dbo.InfinityBilling_InvoiceMaster where BillingPeriod like @Condition          
and BillingPeriod like '% ~ %'          
union all          
select ProjectID, ProjectNumber, InvoiceNumber, BillingPeriod,Invoice_OrderCount, Invoice_Amount  from InfinityBilling_UW.dbo.InfinityBilling_InvoiceMaster where           
BillingPeriod in (select BillingPeriod from InfinityBilling_UW.dbo.ProjectBillingDetails where cast(AddedDate as date) between cast(@From as date) and cast(dateadd(month,1,dateadd(day,3,cast(@From as date))) as date) and BillingPeriod    
      
        
 not like '% ~ %')          
) as t          
CREATE CLUSTERED INDEX IX_BillingData_ProjectID ON #BillingData(ProjectID);
--select * from #BillingData          
          
          
--set @ToDate = '25-Aug-2022'          
set @FromDate = '26-'+left(datename(Month,DATEADD(month,-1,cast(@From as date))),3)+'-'+cast(DATEPART(Year,DATEADD(month,-1,cast(@From as date))) as nvarchar(100))                              
set @ToDate = '25-'+left(datename(Month,cast(@From as date)),3)+'-'+cast(DATEPART(Year,cast(@From as date)) as nvarchar(100))          
        
 select Code, Date, (select ProjectName from Project where ProjectID=tt.Project) as Project,          
(select ProcessName from Process where ProcessID=tt.Process) as Process, Production, Target into #Production          
FROM  dbo.DailyProductvity tt WHERE CAST(Date AS DATETIME) BETWEEN CAST(@FromDate AS DATETIME) AND CAST(@ToDate AS DATETIME)                   
AND dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),Target)) > 0 and NULLIF(LTRIM(RTRIM(tt.Production)),N'') is not null and Code not in (select Code from EmployeeInfo where Domain=9)          
select Code, Project, Process, sum(isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),Production))),0)) as Production, sum(isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),Target))),0)) as Target into #Production1 from #Production          
group by Code, Project, Process          
          
select *,cast((Production/Target)*100 as decimal(18,2)) as [Productivity%] into #Production2 from #Production1          
          
select P.*,(select SubDomainName from SubDomain where SubDomainID =(select SubdomainId from Project where ProjectName=P.Project)) as SubDomain, Floor(isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),E.Salary))),0)) as GrossSalary, Floor(isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),I.DueSalary))),0)) as DueSalary,          
case when isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),I.ESI))),0)>0 then Floor(((isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),I.DueSalary))),0)*3.75)/100)) else 0 end as ESI,          
case when isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),I.PF))),0)>0 then (case when Floor(((isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),I.Basic1))),0)*12)/100))>1800 then 1800 else Floor(((isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),I.Basic1))),0)*12)/100)) end) else 0 end as PF,          
Floor((isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),DueSalary))),0)/nullif(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),NetDays))),0)) * cast(1.75 as decimal(18,2))) as LeaveEncashment,          
(select isnull(Sum(isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),Amount))),0)),0) from IncentiveMaster where Code=P.Code and MOnth=@Month and Year=@Year) as Incentive          
into #Production3          
from #Production2 P          
left join EmployeeInfo_ForSalary E on E.Code=P.Code           
left join InfinitySalary I on I.EmployeeID=E.EmployeeID          
where I.Month=@Month and I.Year=@Year  and E.Month=@Month and E.Year=@Year          
        
          
select *,DueSalary+ESI+PF+LeaveEncashment+Incentive as TotalSalary into #Production4 from #Production3          
        
          
select *,          
case when (cast((cast([Productivity%] as decimal(18,3))/(select sum(cast([Productivity%] as decimal(18,3))) from #Production4 O2 where O2.Code=#Production4.Code)) as decimal(18,3)) >1) then 1           
else cast((cast([Productivity%] as decimal(18,3))/(select sum(cast([Productivity%] as decimal(18,3))) from #Production4 O2 where O2.Code=#Production4.Code)) as decimal(18,3)) end as Ratio,           
(case when (cast((cast([Productivity%] as decimal(18,3))/(select sum(cast([Productivity%] as decimal(18,3))) from #Production4 O2 where O2.Code=#Production4.Code)) as decimal(18,3)) >1) then 1           
else cast((cast([Productivity%] as decimal(18,3))/(select sum(cast([Productivity%] as decimal(18,3))) from #Production4 O2 where O2.Code=#Production4.Code)) as decimal(18,3)) end) * 100 as Weightage into        
#Production5 from #Production4          
--group by Code,Project,Process,Production,Target,[Productivity%],SubDomain,GrossSalary,DueSalary,ESI,PF,LeaveEncashment,Incentive,TotalSalary          
          
          
--select *,          
--case when (cast((cast([Productivity%] as decimal(18,2))/cast(100 as decimal(18,2))) as decimal(18,2)) >1) then 1           
--else cast((cast([Productivity%] as decimal(18,2))/cast(100 as decimal(18,2))) as decimal(18,2)) end as Ratio,           
--case when cast([Productivity%] as decimal(18,2))>100 then 100 else cast(cast([Productivity%] as decimal(18,2)) as decimal(18,2)) end as Weightage into #Production5 from #Production4          
          
          
          
--truncate table tblTrackingForProductionVsSalary                  
                  
--exec usp_getTrakcinDataForProductivity @FromDate, @ToDate                  
--delete from tblTrackingForProductionVsSalary where Code is NULL                  
--delete from tblTrackingForProductionVsSalary where Code in ('FBT','BVN')                  
--update tblTrackingForProductionVsSalary set Process='Compliance Review' where Process='ComplianceReview'                  
              
          
--select ProjectId, Code, Employee, LocationCode,Process, Replace(Convert(nvarchar(12),ProcessDate,106),' ','-') as ProcessDate,Target, Count(LoanNo) as LoanCount into #Prod1 from                  
--tblTrackingForProductionVsSalary --where Flag='Credit'                  
--group by ProjectId, Code, Employee, LocationCode,Process, Replace(Convert(nvarchar(12),ProcessDate,106),' ','-'),Target          
  select ProjectId, P.Code, Employee,LocationCode, Process, Replace(Convert(nvarchar(12),EndDate,106),' ','-') as ProcessDate,Target, Count(LoanNo) as LoanCount into #Prod1 from                    
ProductionData P         
left join EmployeeConfiguration EC on EC.Code=P.Code and EC.EmpConfigrationID=(select Top 1 EC1.EmpConfigrationID from EmployeeConfiguration EC1        
where EC1.PsuedoName=EC.PsuedoName and (IsDelete=0 or IsDelete is null) order by AddedDate desc)        
where cast(EndDate as date) between cast(@FromDate as date) and Cast(@ToDate as date)        
group by ProjectId, P.Code, Employee, LocationCode,Process, Replace(Convert(nvarchar(12),EndDate,106),' ','-'),Target            
            
                 
          
          
select * into #ProPerc from (            
select ProjectId, Code, Employee, LocationCode,Process,sum(Target) as Target, sum(LoanCount) as LoanCount,             
cast((cast(sum(LoanCount) as decimal(18,2))/cast(sum(Target) as decimal(18,2)))*cast(100 as decimal(18,2)) as decimal(18,2)) as [Productivity%] from                    
#Prod1 where (Code is not null and Code!='')        
group by ProjectId, Code, Employee, LocationCode,Process            
union ALL                   
select D.Project,D.Code, EC.PsuedoName as Employee, EC.LocationCode, P.ProcessName as Process,           
sum(isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),D.Target))),0)) as Target, sum(isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),D.Production))),0)) as LoanCount,          
cast((sum(isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),D.Production))),0))/nullif(sum(isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),D.Target))),0)),0))*cast(100 as decimal(18,2)) as decimal(18,2)) as [Productivity%] from DailyProductvity D                   
left join EmployeeConfiguration EC on EC.Code=D.Code and EC.EmpConfigrationID=(select Top 1 EmpConfigrationID from EmployeeConfiguration where                   
Code=EC.Code and (EC.IsDelete=0 or EC.IsDelete is null) order by cast(D.AddedDate as date))                  
left join Process P on P.ProcessID=D.Process                  
where cast(D.Date as date) between cast(@FromDate as date) and Cast(@ToDate as date) and D.Process in                   
(select ProcessId from Process where ProcessName in ('BK Search','Clean-up','Inventory','PH-CC Rework','Title and Servicing Side'))            
group by D.Project,D.Code, EC.PsuedoName, EC.LocationCode, P.ProcessName          
) as t                
                  
------- CREDIT --- Process wise -- Tables[1]                  
select ProjectName,T.ProjectId,Code, Employee,LocationCode, Process,Target,LoanCount,                  
cast(((cast(LoanCount as decimal(18,2))/cast(Target as decimal(18,2)))*100) as decimal(18,2)) as ProdPerc into #Overall          
from #ProPerc T left join Project P on P.ProjectID=T.ProjectId          
          
--select T.ProjectName,T.ProjectId,Code, Employee,Process,Target,LoanCount,                  
--avg(ProdPerc) as ProdPerc into #Overall                   
--from #Overall5 T left join Project P on P.ProjectID=T.ProjectId          
--group by T.ProjectName,T.ProjectId,Code, Employee,Process,Target,LoanCount          
          
select P.Code, ProjectName as Project, P.Process, LoanCount as Production, Target, ProdPerc as [Productivity%],
(select SubdomainName from Subdomain where SubdomainID=(select SubdomainID from Project where ProjectName=P.ProjectName)) as SubDomain,
Floor(isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),E.Salary))),0)) as GrossSalary,
Floor(isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),I.DueSalary))),0)) as DueSalary,          
case when isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),I.ESI))),0)>0 then Floor(((isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),I.DueSalary))),0)*3.75)/100)) else 0 end as ESI,          
case when isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),I.PF))),0)>0 then (case when Floor(((isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),I.Basic1))),0)*12)/100))>1800 then 1800 else Floor(((isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),I.Basic1))),0)*12)/100)) end) else 0 end as PF,          
Floor((isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),DueSalary))),0)/nullif(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),NetDays))),0)) * cast(1.75 as decimal(18,2))) as LeaveEncashment,          
(select isnull(Sum(isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),Amount))),0)),0) from IncentiveMaster where Code=P.Code and MOnth=@Month and Year=@Year) as Incentive into #Overall1 from #Overall P          
left join EmployeeInfo_ForSalary E on E.Code=P.Code          
left join InfinitySalary I on I.EmployeeID=E.EmployeeID          
where I.Month=@Month and I.Year=@Year  and E.Month=@Month and E.Year=@Year          
          
select *,DueSalary+ESI+PF+LeaveEncashment+Incentive as TotalSalary into #Overall2 from #Overall1          
          
select *,          
case when (cast((cast([Productivity%] as decimal(18,4))/ (select sum(cast([Productivity%] as decimal(18,4))) from #Overall2 O2 where O2.Code=#Overall2.Code)) as decimal(18,4)) >1) then 1           
else cast((cast([Productivity%] as decimal(18,4))/(select sum(cast([Productivity%] as decimal(18,4))) from #Overall2 O2 where O2.Code=#Overall2.Code)) as decimal(18,4)) end as Ratio,           
(case when (cast((cast([Productivity%] as decimal(18,4))/(select sum(cast([Productivity%] as decimal(18,4))) from #Overall2 O2 where O2.Code=#Overall2.Code)) as decimal(18,4)) >1) then 1           
else cast((cast([Productivity%] as decimal(18,4))/(select sum(cast([Productivity%] as decimal(18,4))) from #Overall2 O2 where O2.Code=#Overall2.Code)) as decimal(18,4)) end) * 100 as Weightage into #Overall3 from #Overall2          
--group by Code,Project,Process,Production,Target,[Productivity%],SubDomain,GrossSalary,DueSalary,ESI,PF,LeaveEncashment,Incentive,TotalSalary          
          
--select *,          
--case when (cast((cast([Productivity%] as decimal(18,2))/cast(100 as decimal(18,2))) as decimal(18,2)) >1) then 1           
--else cast((cast([Productivity%] as decimal(18,2))/cast(100 as decimal(18,2))) as decimal(18,2)) end as Ratio,           
--case when cast([Productivity%] as decimal(18,2))>100 then 100 else cast(cast([Productivity%] as decimal(18,2)) as decimal(18,2)) end as Weightage into #Overall3 from #Overall2          
  update #Production5 set Ratio=1, Weightage=100 where Ratio=0        
select * into #Userwise from (          
select *, ((TotalSalary) * Ratio) as NetOutGoing from #Production5           
union all          
select *, ((TotalSalary) * Ratio) as NetOutGoing from #Overall3          
) as t          
          
update #Userwise set Subdomain='Not Alloted' where Subdomain='Select'        
        
        
select *, (select DomainGroupName from DomainGroup where DomainGroupId=(select DomainID from Subdomain S where S.SubdomainName=t.SubDomain)) as Domain into #Userwise1 from (          
select U.*, FirstName+' '+MiddleName+' '+lastName as Name, BranchName, DepartmentName  from #Userwise U left join EmployeeInfo_ForSalary E on E.Code=U.Code          
left join Branch B on B.BranchID=E.WorkingBranch          
left join Department d on d.DepartmentID=E.Department          
where E.Month=@Month and E.Year=@Year        
) as t          
   update #Userwise1  set #Userwise1.Domain=(select D1.DomainGroupName from DomainGroup D1         
   where D1.DomainGroupId= (select D.DomainGroupId from Domain D where D.DomainId=        
   (select EmployeeInfo_ForSalary.Domain from EmployeeInfo_ForSalary       
   where Code=#Userwise1.Code and EmployeeInfo_ForSalary.Month=@Month and EmployeeInfo_ForSalary.Year=@Year))),        
SubDomain=(select SubDomain from EmployeeInfo_ForSalary where Code=#Userwise1.Code       
and EmployeeInfo_ForSalary.Month=@Month and EmployeeInfo_ForSalary.Year=@Year) where Domain is null        
        
select E.Code,'' as Project, '' as Process, 0 as Production, 0 as Target, 0 as [Productivity%],           
case when Subdomain is null or Subdomain='Select' then DomainName else SubDomain end Subdomain, isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),E.Salary))),0) Salary, Floor(isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),I.DueSalary))),0)) as DueSalary,          
case when isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),I.ESI))),0)>0 then Floor(((isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),I.DueSalary))),0)*3.75)/100)) else 0 end as ESI,          
case when isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),I.PF))),0)>0 then (case when Floor(((isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),I.Basic1))),0)*12)/100))>1800 then 1800 else Floor(((isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),I.Basic1))),0)*12)/100)) end) else 0 end as PF,          
Floor((isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),DueSalary))),0)/nullif(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),NetDays))),0)) * cast(1.75 as decimal(18,2))) as LeaveEncashment,          
(select isnull(Sum(isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),Amount))),0)),0) from IncentiveMaster where Code=E.Code and Month=@Month and Year=@Year) as Incentive,          
FirstName+' '+MiddleName+' '+lastName as Name, BranchName, DepartmentName, case when E.SubDomain='Credit' and E.Domain=9 then 'Underwriting Credit'  when E.SubDomain='Servicing' and E.Domain=9 then 'Underwriting Servicing'       
else (select DomainGroupName from DomainGroup where DomainGroupId=DM.DomainGroupId) end as Domain into #Other from EmployeeInfo_ForSalary E          
left join Branch B on B.BranchID=E.WorkingBranch          
left join Department d on d.DepartmentID=E.Department          
left join InfinitySalary I on I.EmployeeID=E.EmployeeID    and I.Month=E.Month and I.Year=E.Year      
left join Domain DM on DM.DomainID=E.Domain          
where E.Month=@Month and E.Year=@Year and E.Code not in (select Code from #Userwise1)          
          
        
 update #Other  set #Other.Domain=(select D1.DomainGroupName from DomainGroup D1 where D1.DomainGroupId=       
 (select D.DomainGroupId from Domain D where D.DomainId=(select EmployeeInfo.Domain from EmployeeInfo where Code=#Other.Code))),        
SubDomain=(select SubDomain from EmployeeInfo where Code=#Other.Code) where Domain is null        
        
update #Other set Subdomain='Not Alloted' where Subdomain='Select'        
select * into #Userwise2 from (          
select * from #Userwise1          
union all          
select Code, Project, Process, Production, Target, [Productivity%], Subdomain, Salary, DueSalary, ESI, PF, LeaveEncashment, Incentive,DueSalary+ESI+PF+LeaveEncashment+Incentive as TotalSalary, 1 as Ration, 100 as Weightage,        
--DueSalary+ESI+PF as NetOutGoing,Name, BranchName, DepartmentName, Domain from #Other          
DueSalary+ESI+PF+LeaveEncashment as NetOutGoing,Name, BranchName, DepartmentName, Domain from #Other          
) as td          
CREATE NONCLUSTERED INDEX IX_Userwise2_Costing
ON #Userwise2(Domain,DepartmentName)
INCLUDE(SubDomain,Project);
        
update #Userwise2 set Project=Domain where Project='' and Domain not in ('Support')        
      
update #Userwise2 set Domain = (case when Project in (select ProjectName from Project where SubdomainID=99) then 'Canopy' else Domain end),      
SubDomain = (case when Project in (select ProjectName from Project where SubdomainID=99) then 'Canopy-Credit' else SubDomain end)      
if @OutputMode=N'CostingDetails'
begin
 select Code,Name,DepartmentName Department,Domain,SubDomain Subdomain,Project,Process,
 isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),GrossSalary))),0) [Gross Salary],isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),DueSalary))),0) [Gross Pay],
 isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),Incentive))),0) Incentive,isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),ESI))),0) ESI,isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),PF))),0) PF,
 isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),LeaveEncashment))),0) [Leave Encashment],isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),TotalSalary))),0) [Total Salary],
 isnull(CONVERT(decimal(18,4),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),Ratio))),0) Ratio,isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),Weightage))),0) Weightage,
 isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),NetOutGoing))),0) [Net Outgoing]
 from #Userwise2 U where
 (@CostingVendor=N'Production + Mgmt salary' and U.Domain in (N'Underwriting Credit',N'Underwriting Servicing')
    and U.DepartmentName not in (N'Marketing',N'HR') and (@CostingProject is null or @CostingProject=N'' or U.Project=@CostingProject))
 or (@CostingVendor=N'India Sales salary' and U.Domain in (N'Underwriting Credit',N'Underwriting Servicing') and U.DepartmentName=N'Marketing')
 or (@CostingVendor=N'Support Salary' and U.Domain=N'Support' and U.DepartmentName not in (N'Marketing',N'HR'))
 or (@CostingVendor=N'Total cost of HR' and U.DepartmentName=N'HR')
 order by Name,Project,Process
 return
end
-- select * from #Userwise2   where Project=''        
if isnull(@OutputMode,N'')<>N'Costing'
select Code, Name, BranchName as Branch, DepartmentName as Department, Domain, SubDomain as Subdomain,Project, Process,   
Production as [Order/Loan Count], Target, [Productivity%] as [Productivity %],Ratio, GrossSalary as [Gross Salary],   
DueSalary as [Gross Pay], Incentive,ESI as [ESI], PF as [PF], LeaveEncashment as [Leave Encashment],  
TotalSalary as [Total], NetOutGoing as [Net Outgoing]  
from #Userwise2          
          
select Domain,           
Subdomain, sum(case when DepartmentName in ('Marketing','HR') then 0 else NetOutGoing end) as [Production + Mgmt Salary],          
sum(case when DepartmentName='Marketing' then NetOutGoing else 0 end) as [India Sales Salary],          
sum(case when DepartmentName='HR' then 0 else NetOutGoing end) as Total          
into #Domain1          
from #Userwise2          
where Domain not in ('Support') --and Project not in ('')            
group by Domain,Subdomain          
order by Domain,Subdomain          
          
declare @TotalSalary int          
declare @SupportSalary int          
declare @CostOfHR int
declare @IndiaSalesSalary decimal(18,2)
declare @UWIndiaSalesSalary decimal(18,2)
declare @ProductionMgmtSalary decimal(18,2)
declare @IndiaSalesEmployees int,@SupportEmployees int,@HREmployees int
declare @MSEB int          
set @MSEB = 0          
set @MSEB = (select sum(isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),Amount))),0)) from InfinityOtherCost where CostType='Electricity' and Month=@Month and Year=@Year)          
declare @Internet int          
set @Internet = 0          
set @Internet = (select sum(isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),Amount))),0)) from InfinityOtherCost where CostType='Internet' and Month=@Month and Year=@Year)          
declare @PremiseRent int          
set @PremiseRent = 0          
set @PremiseRent = (select sum(isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),Amount))),0)) from InfinityOtherCost where CostType='PremisesRental' and Month=@Month and Year=@Year)          
declare @Administrative int          
set @Administrative = 0          
set @Administrative = (select isnull(sum(isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),Amount))),0)),0) from InfinityOtherCost where CostType='AdminstrationAndGeneralExpenses' and Month=@Month and Year=@Year)          
declare @PepairMaintenance int          
set @PepairMaintenance = 0          
set @PepairMaintenance = (select isnull(sum(isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),Amount))),0)),0) from InfinityOtherCost where (CostType='RepairAndMaintenance' or CostType='Maintenance') and Month=@Month and Year=@Year)          
declare @Depreciation int          
set @Depreciation = 0          
set @Depreciation = (select isnull(sum(isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),Amount))),0)),0) from InfinityOtherCost where (CostType='Depreciation' or CostType='DepreciationInsurance') and Month=@Month and Year=@Year)          
--PerDomain and all Domain          
declare @USPayroll int          
declare @isUSPayrollDomain bit          
set @isUSPayrollDomain = 0          
set @USPayroll = 0          
set @USPayroll = (select isnull(sum(isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),Amount))),0)),0) from InfinityOtherCost where CostType='USPayroll' and Month=@Month and Year=@Year)          
if exists(select * from InfinityOtherCost where CostType='USPayroll' and Month=@Month and Year=@Year and SubdomainID is not null)          
begin          
 set @isUSPayrollDomain = 1          
end          
          
declare @USPayrollAllocation int          
declare @isUSPayrollAllocationDomain bit          
set @isUSPayrollAllocationDomain = 0          
set @USPayrollAllocation = 0          
set @USPayrollAllocation = (select isnull(sum(isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),Amount))),0)),0) from InfinityOtherCost where CostType='USPayrollAllocation' and Month=@Month and Year=@Year)          
if exists(select * from InfinityOtherCost where CostType='USPayrollAllocation' and Month=@Month and Year=@Year and SubdomainID is not null)          
begin          
 set @isUSPayrollAllocationDomain = 1          
end          
          
declare @IndContribution int          
declare @IsIndContributionDomain bit          
set @IsIndContributionDomain = 0          
set @IndContribution = 0          
set @IndContribution = (select isnull(sum(isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),Amount))),0)),0) from InfinityOtherCost where CostType='IndependantContribution' and Month=@Month and Year=@Year)          
if exists(select * from InfinityOtherCost where CostType='IndependantContribution' and Month=@Month and Year=@Year and SubdomainID is not null)          
begin          
 set @IsIndContributionDomain = 1          
end          
          
declare @IndirectExpense int          
declare @IsIndirectExpenseDomain bit          
set @IsIndirectExpenseDomain = 0          
set @IndirectExpense = 0          
set @IndirectExpense = (select isnull(sum(isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),Amount))),0)),0) from InfinityOtherCost where CostType='USTotalIndirectExpense' and Month=@Month and Year=@Year)          
if exists(select * from InfinityOtherCost where CostType='USTotalIndirectExpense' and Month=@Month and Year=@Year and SubdomainID is not null)          
begin          
 set @IsIndirectExpenseDomain = 1          
end          
          
declare @MarketingExpense int          
declare @IsMarketingExpenseDomain bit          
set @IsMarketingExpenseDomain = 0          
set @MarketingExpense = 0          
set @MarketingExpense = (select isnull(sum(isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),Amount))),0)),0) from InfinityOtherCost where CostType='USMarketingExpenses' and Month=@Month and Year=@Year)          
if exists(select * from InfinityOtherCost where CostType='USMarketingExpenses' and Month=@Month and Year=@Year and SubdomainID is not null)          
begin          
 set @IsMarketingExpenseDomain = 1          
end          
        
declare @IndiaVendorCost int          
declare @IsIndiaVendorCostDomain bit          
set @IsIndiaVendorCostDomain = 0          
set @IndiaVendorCost = 0          
set @IndiaVendorCost = (select isnull(sum(isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),Amount))),0)),0) from InfinityOtherCost where CostType='IndiaVendorCost' and Month=@Month and Year=@Year)          
if exists(select * from InfinityOtherCost where CostType='IndiaVendorCost' and Month=@Month and Year=@Year and SubdomainID is not null)          
begin          
 set @IsIndiaVendorCostDomain = 1          
end          
          
          
set @SupportSalary = (select isnull(sum(NetOutGoing),0) from #Userwise2 where Domain='Support' and DepartmentName not in ('Marketing','HR'))          
set @CostOfHR = (select isnull(sum(NetOutGoing),0) from #Userwise2 where DepartmentName='HR')
set @IndiaSalesSalary = (select isnull(sum(NetOutGoing),0) from #Userwise2 where Domain not in ('Support') and DepartmentName='Marketing')
set @UWIndiaSalesSalary = (select isnull(sum(NetOutGoing),0) from #Userwise2 where Domain in ('Underwriting Credit','Underwriting Servicing') and DepartmentName='Marketing')
set @ProductionMgmtSalary = (select isnull(sum(NetOutGoing),0) from #Userwise2 where Domain not in ('Support') and DepartmentName not in ('Marketing','HR'))
set @IndiaSalesEmployees=(select count(distinct Code) from #Userwise2 where Domain in ('Underwriting Credit','Underwriting Servicing') and DepartmentName='Marketing')
set @SupportEmployees=(select count(distinct Code) from #Userwise2 where Domain='Support' and DepartmentName not in ('Marketing','HR'))
set @HREmployees=(select count(distinct Code) from #Userwise2 where DepartmentName='HR')
set @TotalSalary = (select isnull(sum(NetOutGoing),0) from #Userwise2 where Domain not in ('Support') and DepartmentName<>'HR')          
select *, @TotalSalary as TotalSalary, cast((([Production + Mgmt Salary]/NULLIF(@TotalSalary,0))*100) as decimal(18,10)) as [Production %], cast((([India Sales Salary]/NULLIF(@TotalSalary,0))*100) as decimal(18,10)) as [India Sales %],          
cast((([Production + Mgmt Salary]+[India Sales Salary])/NULLIF(@TotalSalary,0))*100 as decimal(18,10)) as [Total %] into #Domain2 from #Domain1          
        
select *,cast(cast(@SupportSalary as decimal(18,4))*cast([Total %] as decimal(18,10))/100 as decimal(18,2)) as [Support Salary]          
,cast(cast(@CostOfHR as decimal(18,4))*cast([Total %] as decimal(18,10))/100 as decimal(18,2)) as [Cost of HR]
,cast(Round(cast(@MSEB * cast([Total %] as decimal(18,3)) as decimal(18,2))/100,0) as Decimal(18,0)) as [MSEB]          
,cast(Round(cast(@Internet * cast([Total %] as decimal(18,3)) as decimal(18,2))/100,0) as Decimal(18,0)) as [Internet]          
,cast(Round(cast(@PremiseRent * cast([Total %] as decimal(18,3)) as decimal(18,2))/100,0) as Decimal(18,0)) as [Rent]    
,cast(Round(cast(@Administrative * cast([Total %] as decimal(18,3)) as decimal(18,2))/100,0) as Decimal(18,0)) as [General Expenses]          
,cast(Round(cast(@PepairMaintenance * cast([Total %] as decimal(18,3)) as decimal(18,2))/100,0) as Decimal(18,0)) as [Repair And Maintenance]          
,cast(Round(cast(@Depreciation * cast([Total %] as decimal(18,3)) as decimal(18,2))/100,0) as Decimal(18,0)) as [Depreciation]          
,(select count(Distinct Code) from #Userwise2 where #Userwise2.SubDomain=#Domain2.SubDomain and DepartmentName not in ('Marketing','HR')) as NoOfEmployees        
,case when @isUSPayrollDomain = 0 then cast(Round(cast(@USPayroll * cast([Total %] as decimal(18,3)) as decimal(18,2))/100,0) as Decimal(18,0))          
else (select isnull(sum(isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),Amount))),0)),0) from InfinityOtherCost where CostType='USPayroll' and Month=@Month and Year=@Year and SubdomainID=          
(select SubdomainID from Subdomain where SubdomainName=#Domain2.SubDomain)) end          
as [US Payroll]          
,case when @isUSPayrollAllocationDomain = 0 then cast(Round(cast(@USPayrollAllocation * cast([Total %] as decimal(18,3)) as decimal(18,2))/100,0) as Decimal(18,0))          
else (select isnull(sum(isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),Amount))),0)),0) from InfinityOtherCost where CostType='USPayrollAllocation' and Month=@Month and Year=@Year and SubdomainID=          
(select SubdomainID from Subdomain where SubdomainName=#Domain2.SubDomain)) end          
as [US Payroll Allocation]          
,case when @IsIndContributionDomain = 0 then cast(Round(cast(@IndContribution * cast([Total %] as decimal(18,3)) as decimal(18,2))/100,0) as Decimal(18,0))          
else (select isnull(sum(isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),Amount))),0)),0) from InfinityOtherCost where CostType='IndependantContribution' and Month=@Month and Year=@Year and SubdomainID=          
(select SubdomainID from Subdomain where SubdomainName=#Domain2.SubDomain)) end          
as [Indep - Contr (review/abst plant + Scien+CE + aci/alamo Apprisers]          
,case when @IsIndirectExpenseDomain = 0 then cast(Round(cast(@IndirectExpense * cast([Total %] as decimal(18,3)) as decimal(18,2))/100,0) as Decimal(18,0))          
else (select isnull(sum(isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),Amount))),0)),0) from InfinityOtherCost where CostType='USTotalIndirectExpense' and Month=@Month and Year=@Year and SubdomainID=          
(select SubdomainID from Subdomain where SubdomainName=#Domain2.SubDomain)) end          
as [US Total Indirect Exp (rent, ins, inern, prof fees, T&E, conf, gifts)]    ,case when @IsMarketingExpenseDomain = 0 then cast(Round(cast(@MarketingExpense * cast([Total %] as decimal(18,3)) as decimal(18,2))/100,0) as Decimal(18,0))          
else (select isnull(sum(isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),Amount))),0)),0) from InfinityOtherCost where CostType='USMarketingExpenses' and Month=@Month and Year=@Year and SubdomainID=          
(select SubdomainID from Subdomain where SubdomainName=#Domain2.SubDomain)) end          
as [Marketing Expenses]          
,case when @IsIndiaVendorCostDomain = 0 then cast(Round(cast(@IndiaVendorCost * cast([Total %] as decimal(18,3)) as decimal(18,2))/100,0) as Decimal(18,0))          
else (select isnull(sum(isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),Amount))),0)),0) from InfinityOtherCost where CostType='IndiaVendorCost' and Month=@Month and Year=@Year and SubdomainID=          
(select SubdomainID from Subdomain where SubdomainName=#Domain2.SubDomain)) end          
as [Contract Cost],        
(select isnull(sum(cast(isnull(VendorBilling,0) as decimal(18,2))),0) from InfinityVendorCost where Month=@Month and Year=@Year and ProjectID in (select ProjectID from Project where SubdomainID=          
(select SubdomainID from Subdomain where SubdomainName=#Domain2.SubDomain)) and ProjectID in (select ProjectID from ClientFeedback where         
DomainId in (select DomainID from Domain where DomainGroupId=((select DomainGroupId from DomainGroup where DomainGroupName=#Domain2.Domain))))) as VendorCost        
          
into #Domain3 from #Domain2          

declare @DomainSupportDifference decimal(18,2)=@SupportSalary-(select isnull(sum([Support Salary]),0) from #Domain3)
declare @DomainHRDifference decimal(18,2)=@CostOfHR-(select isnull(sum([Cost of HR]),0) from #Domain3)
update top (1) #Domain3 set [Support Salary]=[Support Salary]+@DomainSupportDifference,[Cost of HR]=[Cost of HR]+@DomainHRDifference
          
select *,([Production + Mgmt Salary]+[India Sales Salary]+[Support Salary]+[Cost of HR]+MSEB+Internet+Rent+[General Expenses]+[Repair And Maintenance]+Depreciation+[Contract Cost]) as TotalCost,        
([US Payroll]+[US Payroll Allocation]+[Indep - Contr (review/abst plant + Scien+CE + aci/alamo Apprisers]+ [US Total Indirect Exp (rent, ins, inern, prof fees, T&E, conf, gifts)]+[Marketing Expenses])          
as [Total of US Expenses]          
into #Domain4 from #Domain3          
          
select *, (TotalCost+VendorCost) as IndiaCost into #Domain5 from #Domain4          
          
if isnull(@OutputMode,N'')<>N'Costing'
select *,cast((IndiaCost / 75) as decimal(18,0)) as [Conversion of India cost In US$ @75],cast(((IndiaCost / 75) + [Total of US Expenses]) as decimal(18,0)) as [India & USA Total Cost in US$]          
,(select isnull(sum(isnull(CONVERT(decimal(18,0),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),Invoice_OrderCount))),0)),0) from #BillingData B where B.ProjectID in          
(select ProjectId from project P where P.SubdomainID in (select S1.SubdomainID from SubDomain S1 where S1.SubdomainName=#Domain5.SubDomain))) as RecordsBilled          
,(select isnull(sum(isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),Invoice_Amount))),0)),0) from #BillingData B where B.ProjectID in          
(select ProjectId from project P where P.SubdomainID in (select S1.SubdomainID from SubDomain S1 where S1.SubdomainName=#Domain5.SubDomain))) as AmountBilled          
from #Domain5          
          
          
select * into #Count from #Userwise2 U3 where U3.Domain not in ('Support') --and U3.Project not like '%Training%' and U3.Project not like '%Practice%' and U3.Project not like '%Test%' and U3.Project not in ('Other','')           
          
          
--select * from #Userwise2          
          
select Project,Domain,           
Subdomain, sum(case when DepartmentName in ('Marketing','HR') then 0 else NetOutGoing end) as [Production + Mgmt Salary],          
case when (select sum(cast(isnull(NetOutGoing,0) as decimal(18,6))) from #Count U2 where DepartmentName not in ('Marketing','HR') and U2.Domain=#Userwise2.Domain and U2.SubDomain=#Userwise2.SubDomain)>0 then
cast(isnull((select sum(cast(isnull(NetOutGoing,0) as decimal(18,6))) from #Userwise2 U2 where DepartmentName='Marketing' and U2.Domain=#Userwise2.Domain and U2.SubDomain=#Userwise2.SubDomain),0)
* sum(case when DepartmentName in ('Marketing','HR') then 0 else cast(NetOutGoing as decimal(18,6)) end)
/ nullif((select sum(cast(isnull(NetOutGoing,0) as decimal(18,6))) from #Count U2 where DepartmentName not in ('Marketing','HR') and U2.Domain=#Userwise2.Domain and U2.SubDomain=#Userwise2.SubDomain),0) as decimal(18,2))
else case when (select count(distinct Project) from #Count C where C.Domain=#Userwise2.Domain and C.SubDomain=#Userwise2.SubDomain)>0 then
cast(isnull((select sum(cast(isnull(NetOutGoing,0) as decimal(18,6))) from #Userwise2 U2 where DepartmentName='Marketing' and U2.Domain=#Userwise2.Domain and U2.SubDomain=#Userwise2.SubDomain),0)
/ nullif((select count(distinct Project) from #Count C where C.Domain=#Userwise2.Domain and C.SubDomain=#Userwise2.SubDomain),0) as decimal(18,2)) else 0 end end as Marketing,          
case when (select cast(sum(cast(isnull(NetOutGoing,0) as decimal(18,2))) as decimal(18,0)) from #Count U2           
where DepartmentName not in ('Marketing','HR') and U2.Domain=#Userwise2.Domain and U2.SubDomain=#Userwise2.SubDomain) <=0 then 0 else           
cast(((sum(case when DepartmentName in ('Marketing','HR') then 0 else NetOutGoing end)/          
(select cast(sum(cast(isnull(NetOutGoing,0) as decimal(18,2))) as decimal(18,0)) from #Count U2           
where DepartmentName not in ('Marketing','HR') and U2.Domain=#Userwise2.Domain and U2.SubDomain=#Userwise2.SubDomain))*100) as decimal(18,3)) end as [Production %]          
into #Projectwise1          
from #Userwise2          
where Domain not in ('Support') --and Project not like '%Training%' and Project not like '%Practice%' and Project not like '%Test%' and Project not in ('Other')          
group by Project,Domain,Subdomain          
order by Project,Domain,Subdomain          
        
        
--select * from #Projectwise1        
        
select *,           
--cast((Marketing * [Production %])/100 as decimal(18,0)) as [Marketing %],          
0 as Training,          
0 as Other          
into #Projectwise2          
from #Projectwise1          
order by Domain, Subdomain, Project          
        
--select *,           
----cast((Marketing * [Production %])/100 as decimal(18,0)) as [Marketing %],          
--isnull(cast((select isnull(cast(sum(cast(isnull(NetOutGoing,0) as decimal(18,2))) as decimal(18,0)),0) from #Userwise2 where Domain not in ('Support') and DepartmentName not in ('Marketing') and Project like '%Training%' and Subdomain=#Projectwise1.SubDomain)/      
--(select count(distinct Project) from #Count C where C.SubDomain=#Projectwise1.SubDomain) as decimal(18,0)),0) as Training,          
--isnull(cast((select isnull(cast(sum(cast(isnull(NetOutGoing,0) as decimal(18,2))) as decimal(18,0)),0) from #Userwise2 where Domain not in ('Support') and Project in ('Other') and Subdomain=#Projectwise1.SubDomain)/          
--(select count(distinct Project) from #Count C where C.SubDomain=#Projectwise1.SubDomain) as decimal(18,0)),0) as Other          
--into #Projectwise2          
--from #Projectwise1          
--order by Domain, Subdomain, Project          
        
        
select Project,Domain,Subdomain,[Production + Mgmt Salary],Marketing as [India Sales Salary],[Production %],Training,Other,
([Production + Mgmt Salary]+Marketing+Training+Other) as [Total Salary] into #Projectwise3          
from #Projectwise2          
        
select *, cast(([Total Salary]/NULLIF((select sum(isnull(P3.[Total Salary],0)) from #Projectwise3 P3),0)) as decimal(18,10)) as [Total %] into #Projectwise4 from #Projectwise3          
          
  select *  into #Projectwise5  from (        
select *,cast(cast([Total %] as decimal(18,10)) * cast(@SupportSalary as decimal(18,4)) as decimal(18,2)) as [Support Salary]          
,cast(cast([Total %] as decimal(18,10)) * cast(@CostOfHR as decimal(18,4)) as decimal(18,2)) as [Cost of HR]
,Floor((cast([Total %] as decimal(18,4)) * @MSEB)) as [MSEB]          
,Floor((cast([Total %] as decimal(18,4)) * @Internet)) as [Internet]          
,Floor((cast([Total %] as decimal(18,4)) * @PremiseRent)) as [Rent]          
,Floor((cast([Total %] as decimal(18,4)) * @Administrative)) as [General Expenses]          
,Floor((cast([Total %] as decimal(18,4)) * @PepairMaintenance)) as [Repair And Maintenance]          
,Floor((cast([Total %] as decimal(18,4)) * @Depreciation)) as [Depreciation],         
(select isnull(Floor(cast(isnull(VendorBilling,0) as decimal(18,2))),0) from InfinityVendorCost where ProjectID=(select projectID from Project where ProjectName=#Projectwise4.Project)) as VendorCost        
from #Projectwise4          
--union all        
--select Project,Domain,           
--Subdomain, isnull(cast(sum(cast(isnull(NetOutGoing,0) as decimal(18,2))) as decimal(18,0)),0)  as Production,          
--0 as Marketing,          
--0 as [Production %],0 as Training,          
--0 as Other,0 as [Total Salary],0 as [Total %],0as [Support Salary]         
--,0as [MSEB]          
--,0 as [Internet]          
--,0 as [Rent]          
--,0as [General Expenses]          
--,0 as [Repair And Maintenance]          
--,0 as [Depreciation], 0 as VendorCost        
--from #Userwise2          
--where Domain not in ('Support') and Project in ('')          
--group by Project,Domain,Subdomain          
  ) as t        

declare @ProjectSalesDifference decimal(18,2)=@IndiaSalesSalary-(select isnull(sum([India Sales Salary]),0) from #Projectwise5)
declare @ProjectSupportDifference decimal(18,2)=@SupportSalary-(select isnull(sum([Support Salary]),0) from #Projectwise5)
declare @ProjectHRDifference decimal(18,2)=@CostOfHR-(select isnull(sum([Cost of HR]),0) from #Projectwise5)
update top (1) #Projectwise5 set [India Sales Salary]=[India Sales Salary]+@ProjectSalesDifference,
[Total Salary]=[Total Salary]+@ProjectSalesDifference,[Support Salary]=[Support Salary]+@ProjectSupportDifference,
[Cost of HR]=[Cost of HR]+@ProjectHRDifference
        
        
  --select * from #Projectwise5        
        
select *, ([Total Salary]+[Support Salary]+[Cost of HR]+MSEB+Internet+Rent+[General Expenses]+[Repair And Maintenance]+Depreciation+Isnull(VendorCost,0)) as [Total Cost],          
          
cast((((select cast(sum(cast(isnull(Ratio,0) as decimal(18,2))) as decimal(18,0)) from #Userwise2 U2 where           
Domain not in ('Support') and DepartmentName not in ('Marketing','HR') and  U2.SubDomain=#Projectwise5.SubDomain)/          
(select count(distinct Project) from #Count C where C.SubDomain=#Projectwise5.SubDomain))) as decimal(18,2)) as [No of Employees],          
([Total Salary]+[Support Salary]+[Cost of HR]) as [Total Cost + Support Salary]          
into #Projectwise6          
from #Projectwise5          
          
select (select ProjectID from Project where ProjectName=#Projectwise6.Project) as ProjectID,*          
, cast((case when [No of Employees]>0 then ([Total Cost]/ [No of Employees]) else 0 end) as decimal(18,0))  as [Cost/FTE]           
, cast((case when [No of Employees]>0 then (([Production + Mgmt Salary] + Training)/ [No of Employees]) else 0 end) as decimal(18,0))  as [Cost/FTE (Production + Training)]          
, cast((case when [No of Employees]>0 then (([Production + Mgmt Salary] + Training + [India Sales Salary] + [Support Salary] + [Cost of HR])/ [No of Employees]) else 0 end) as decimal(18,0))  as [Cost/FTE (Production + Training + India Sales + Support + HR)]          
into #Projectwise7          
from #Projectwise6          
          
select *,(select isnull(sum(isnull(CONVERT(decimal(18,0),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),Invoice_OrderCount))),0)),0) from #BillingData B where B.ProjectID=#Projectwise7.ProjectID) as RecordsBilled          
,(select isnull(sum(isnull(CONVERT(decimal(18,2),dbo.ufn_SafeNumeric(CONVERT(NVARCHAR(4000),Invoice_Amount))),0)),0) from #BillingData B where B.ProjectID=#Projectwise7.ProjectID) as AmountBilled          
into #Projectwise8          
from #Projectwise7          
          
select *,Floor(case when RecordsBilled > 0 then (([Production + Mgmt Salary]+Training)/RecordsBilled) else 0 end) as [Cost/Record(Production + Training)],          
Floor(case when RecordsBilled > 0 then (([Production + Mgmt Salary] + Training + [India Sales Salary] + [Support Salary] + [Cost of HR])/RecordsBilled) else 0 end) as [Cost/Record (Production + Training + India Sales + Support + HR)],          
Floor(case when RecordsBilled > 0 then (([Total Cost])/RecordsBilled) else 0 end) as [Cost/Record (Total Cost)],          
case when (select Replace(Convert(nvarchar(12), cast(ProjectStartDate as date),106),' ','-')  from ProjectConfiguration where ProjectID=#Projectwise8.ProjectID) is NULL then          
(select Replace(Convert(nvarchar(12), cast(ProjectStartDate as date),106),' ','-')  from ProjectConfiguration where ProjectID=#Projectwise8.ProjectID) else          
(select Replace(Convert(nvarchar(12), cast(ProjectStartDate as date),106),' ','-')  from ClientFeedback where ProjectId=#Projectwise8.ProjectID) end as [Project Start MM/YYYY]          
into #FinalProjectwise
from #Projectwise8

declare @FinalProductionMgmtSalary decimal(18,2),@FinalIndiaSalesSalary decimal(18,2),@FinalSupportSalary decimal(18,2),@FinalCostOfHR decimal(18,2)
select @FinalProductionMgmtSalary=isnull(sum([Production + Mgmt Salary]),0),
@FinalIndiaSalesSalary=isnull(sum([India Sales Salary]),0),@FinalSupportSalary=isnull(sum([Support Salary]),0),
@FinalCostOfHR=isnull(sum([Cost of HR]),0) from #FinalProjectwise
if abs(@FinalProductionMgmtSalary-@ProductionMgmtSalary)>0.01 or abs(@FinalIndiaSalesSalary-@IndiaSalesSalary)>0.01
or abs(@FinalSupportSalary-@SupportSalary)>0.01 or abs(@FinalCostOfHR-@CostOfHR)>0.01
throw 50004,N'Final salary classifications do not reconcile with employee salary data.',1;

if @OutputMode=N'Costing'
begin
 select F.*,cast(F.[Total %]/nullif(sum(F.[Total %]) over(),0) as decimal(18,10)) UWWeight,
 cast(@UWIndiaSalesSalary*(F.[Total %]/nullif(sum(F.[Total %]) over(),0)) as decimal(18,2)) UWIndiaSales,
 cast(@SupportSalary*(F.[Total %]/nullif(sum(F.[Total %]) over(),0)) as decimal(18,2)) UWSupport,
 cast(@CostOfHR*(F.[Total %]/nullif(sum(F.[Total %]) over(),0)) as decimal(18,2)) UWCostOfHR,
 convert(int,round(@IndiaSalesEmployees*(F.[Total %]/nullif(sum(F.[Total %]) over(),0)),0)) UWIndiaSalesEmployees,
 convert(int,round(@SupportEmployees*(F.[Total %]/nullif(sum(F.[Total %]) over(),0)),0)) UWSupportEmployees,
 convert(int,round(@HREmployees*(F.[Total %]/nullif(sum(F.[Total %]) over(),0)),0)) UWHREmployees
 into #UnderwritingCosting from #FinalProjectwise F
 where F.Domain in (N'Underwriting Credit',N'Underwriting Servicing')

 declare @UWSalesDifference decimal(18,2)=@UWIndiaSalesSalary-(select isnull(sum(UWIndiaSales),0) from #UnderwritingCosting)
 declare @UWSupportDifference decimal(18,2)=@SupportSalary-(select isnull(sum(UWSupport),0) from #UnderwritingCosting)
 declare @UWHRDifference decimal(18,2)=@CostOfHR-(select isnull(sum(UWCostOfHR),0) from #UnderwritingCosting)
 declare @UWSalesEmployeeDifference int=@IndiaSalesEmployees-(select isnull(sum(UWIndiaSalesEmployees),0) from #UnderwritingCosting)
 declare @UWSupportEmployeeDifference int=@SupportEmployees-(select isnull(sum(UWSupportEmployees),0) from #UnderwritingCosting)
 declare @UWHREmployeeDifference int=@HREmployees-(select isnull(sum(UWHREmployees),0) from #UnderwritingCosting)
 update top (1) #UnderwritingCosting set UWIndiaSales=UWIndiaSales+@UWSalesDifference,
 UWSupport=UWSupport+@UWSupportDifference,UWCostOfHR=UWCostOfHR+@UWHRDifference,
 UWIndiaSalesEmployees=UWIndiaSalesEmployees+@UWSalesEmployeeDifference,
 UWSupportEmployees=UWSupportEmployees+@UWSupportEmployeeDifference,UWHREmployees=UWHREmployees+@UWHREmployeeDifference

 select V.Vendor,N'' as ERPProcess,
 case when replace(isnull(F.Project,N''),N'-',N' ') in (N'',N'NA',N'Underwriting Credit',N'Underwriting Servicing') then N'' else F.Project end Project,
 cast(V.Amount as decimal(18,2)) Amount,convert(bigint,V.Volume) Volume
 from #UnderwritingCosting F
 cross apply (values
  (N'Production + Mgmt salary',isnull(F.[Production + Mgmt Salary],0),convert(int,round(isnull(F.[No of Employees],0),0))),
  (N'India Sales salary',isnull(F.UWIndiaSales,0),F.UWIndiaSalesEmployees),
  (N'Support Salary',isnull(F.UWSupport,0),F.UWSupportEmployees),
  (N'Total cost of HR',isnull(F.UWCostOfHR,0),F.UWHREmployees),
  (N'Total',isnull(F.[Production + Mgmt Salary],0)+isnull(F.UWIndiaSales,0)+isnull(F.UWSupport,0)+isnull(F.UWCostOfHR,0),convert(int,round(isnull(F.[No of Employees],0),0))+F.UWIndiaSalesEmployees+F.UWSupportEmployees+F.UWHREmployees)
 ) V(Vendor,Amount,Volume)
end
else select * from #FinalProjectwise
          
        
          
--select * from #BillingData          
          
drop table #Count          
drop table #Projectwise1          
drop table #Projectwise2          
drop table #Projectwise3          
drop table #Projectwise4          
drop table #Projectwise5          
drop table #Projectwise6          
drop table #Projectwise7          
drop table #Projectwise8          
drop table #FinalProjectwise
drop table #Domain1          
drop table #Domain2          
drop table #Domain3          
drop table #Domain4          
drop table #Domain5          
          
drop table #Other          
drop table #Prod1          
drop table #ProPerc          
drop table #Overall          
drop table #Overall1          
drop table #Overall2          
drop table #Overall3          
drop table #Production          
drop table #Production1          
drop table #Production2          
drop table #Production3          
drop table #Production4          
drop table #Production5          
drop table #Userwise          
drop table #Userwise1          
drop table #Userwise2          
drop table #BillingData          
end

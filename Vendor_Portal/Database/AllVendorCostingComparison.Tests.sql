-- Run after CostingMaster.sql and AllVendorCostingComparison.sql.
SET NOCOUNT ON;

-- Monthly with previous period.
EXEC dbo.usp_AllVendorCostingComparison
    @PeriodAFrom='2026-09-01', @PeriodATo='2026-09-30',
    @PeriodBFrom='2026-08-01', @PeriodBTo='2026-08-31';

-- Calendar quarter with preceding quarter.
EXEC dbo.usp_AllVendorCostingComparison
    @PeriodAFrom='2026-07-01', @PeriodATo='2026-09-30',
    @PeriodBFrom='2026-04-01', @PeriodBTo='2026-06-30';

-- YTD example where the configured start month is January.
EXEC dbo.usp_AllVendorCostingComparison
    @PeriodAFrom='2026-01-01', @PeriodATo='2026-09-30',
    @PeriodBFrom='2025-01-01', @PeriodBTo='2025-09-30';

-- Previous-year comparison.
EXEC dbo.usp_AllVendorCostingComparison
    @PeriodAFrom='2026-04-01', @PeriodATo='2026-06-30',
    @PeriodBFrom='2025-04-01', @PeriodBTo='2025-06-30';

-- Independent manual ranges.
EXEC dbo.usp_AllVendorCostingComparison
    @PeriodAFrom='2026-01-01', @PeriodATo='2026-03-31',
    @PeriodBFrom='2025-07-01', @PeriodBTo='2025-12-31';

-- Cross-financial-year example where the configured start month is October.
EXEC dbo.usp_AllVendorCostingComparison
    @PeriodAFrom='2025-10-01', @PeriodATo='2026-03-31',
    @PeriodBFrom='2024-10-01', @PeriodBTo='2025-03-31';

-- No comparison.
EXEC dbo.usp_AllVendorCostingComparison
    @PeriodAFrom='2026-07-01', @PeriodATo='2026-07-31',
    @PeriodBFrom=NULL, @PeriodBTo=NULL;

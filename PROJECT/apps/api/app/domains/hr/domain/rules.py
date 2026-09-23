from datetime import date


class HRDomainRules:
    @staticmethod
    def validate_leave_dates(start_date: date, end_date: date) -> bool:
        return end_date >= start_date

    @staticmethod
    def calculate_leave_days(start_date: date, end_date: date) -> int:
        return (end_date - start_date).days + 1

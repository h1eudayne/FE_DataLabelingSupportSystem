namespace DTOs.Constants
{
    public static class UserRoles
    {
        public const string Admin = "Admin";
        public const string Manager = "Manager";
        public const string Reviewer = "Reviewer";
        public const string Annotator = "Annotator";

        public static bool IsValid(string role)
        {
            return role == Admin || role == Manager || role == Reviewer || role == Annotator;
        }
    }
}
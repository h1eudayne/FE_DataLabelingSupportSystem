import { useTranslation } from "react-i18next";

const UserFilter = ({ onSearch }) => {
  const { t } = useTranslation();

  return (
    <div className="mb-4">
      <div className="admin-search-field">
        <i className="ri-search-line"></i>
        <input
          type="text"
          placeholder={t("userFilter.searchPlaceholder")}
          onChange={(event) => onSearch(event.target.value)}
        />
      </div>
    </div>
  );
};

export default UserFilter;

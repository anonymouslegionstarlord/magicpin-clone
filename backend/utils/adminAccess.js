const getConfiguredAdminEmail = () =>
    process.env.ADMIN_EMAIL?.trim().toLowerCase();

const isConfiguredAdminEmail = (email) => {
    const adminEmail = getConfiguredAdminEmail();

    return Boolean(
        adminEmail &&
        typeof email === "string" &&
        email.trim().toLowerCase() === adminEmail
    );
};

const isAdminAccount = (user) =>
    Boolean(
        user &&
        user.role === "admin" &&
        isConfiguredAdminEmail(user.email)
    );

module.exports = {
    isConfiguredAdminEmail,
    isAdminAccount
};

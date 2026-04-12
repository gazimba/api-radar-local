export default {
    jwt: {
        secret: process.env.AUTH_SECRET || "default_secret_key",
        expiresIn: "1d"
    },
};
//# sourceMappingURL=auth.js.map
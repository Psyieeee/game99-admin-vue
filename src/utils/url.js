export const url = {
    baseUrl: import.meta.env.VITE_APP_ENV === 'production' || import.meta.env.VITE_APP_ENV === 'staging' ? '' : import.meta.env.VITE_APP_BASE_API,
    game99AdminWeb: '/game99-admin-web',
    game88PlatformAdminWeb: '/game88-platform-admin-web',
    game99PayAdminWeb: '/game99-pay-admin-web',
    game88GameAdminWeb: '/game88-game-admin-web',
    game88LotteryAdminWeb: '/game88-lottery-admin-web',
}

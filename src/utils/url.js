export const url = {
    baseUrl: import.meta.env.VITE_APP_ENV === 'production' || import.meta.env.VITE_APP_ENV === 'staging' ? '' : import.meta.env.VITE_APP_BASE_API,
    game99AdminWeb: '/game99-admin-web',
    game99PlatformAdminWeb: '/game99-platform-admin-web',
    game99PayAdminWeb: '/game99-pay-admin-web',
    game99GameAdminWeb: '/game99-game-admin-web',
    game99LotteryAdminWeb: '/game99-lottery-admin-web',
}

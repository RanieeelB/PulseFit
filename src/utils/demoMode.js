
export const isDemoMode = () => {
    // Check if URL contains /demo or if flag is set in session storage
    return window.location.pathname.includes('/demo') || 
           sessionStorage.getItem('pulsefit_demo_mode') === 'true';
};

export const setDemoMode = (enabled) => {
    if (enabled) {
        sessionStorage.setItem('pulsefit_demo_mode', 'true');
    } else {
        sessionStorage.removeItem('pulsefit_demo_mode');
    }
};

export const getDemoUser = () => ({
    id: 'demo-user-id',
    name: 'Visitante Demo',
    email: 'demo@pulsefit.com',
    level: 12,
    avatar: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop',
    weight: 82.5,
    height: 185,
    diet_profile: {
        gender: 'male',
        weight: 82.5,
        height: 185,
        age: 28,
        activityLevel: 'active',
        goal: 'gain_muscle'
    }
});

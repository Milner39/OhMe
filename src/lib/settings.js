// Settings to control values accross the app
export const settings = {
    session: {
        // How long a session persists before expiring
        duration: 21, // Days

        // How long before expiring should session duration be renewed
        renewalLead: 7, // Days

        // Rules:
            // duration >= renewalLead
    },
    password: {
        // How long a code persists before expiring
        duration: 1, // Hours

        // How long a user has to wait between requesting another code
        cooldown: 1, // Hours

        // Rules:
            // duration >= cooldown
    },
    email: {
        // How long a code persists before expiring
        duration: 1, // Hours

        // How long a user has to wait between requesting another code
        cooldown: 1, // Hours

        // Rules:
            // duration >= cooldown        
    }
}
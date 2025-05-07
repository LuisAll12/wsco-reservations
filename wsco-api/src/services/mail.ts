import emailjs from 'emailjs-com';

export const sendVerificationEmail = async (email: string, verificationCode: string) => {
    const templateParams = {
        to_email: email,
        message: `Ihr Verifizierungscode lautet: ${verificationCode}`,
    };
    const serviceID = "service_wzhmwmh";
    const templateID = "template_z8u5xt3";
    const userID = "n5sGkJrXJbUIwcaC6";

    try {
        await emailjs.send(serviceID, templateID, templateParams, userID);
    } catch (error) {
        console.error("EmailJS Error:", error);
    }
};

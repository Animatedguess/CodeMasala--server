const generateUsername = (firstName, lastName, email) => {
    // Remove special characters & spaces, convert to lowercase
    const sanitize = (str) => str?.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "";

    let baseUsername = "";

    if (firstName || lastName) {
        baseUsername = `${sanitize(firstName)}${sanitize(lastName)}`;
    } else if (email) {
        baseUsername = sanitize(email.split("@")[0]); // Extract from email if needed
    }

    // Ensure username is at least 3 characters long
    if (baseUsername.length < 3) {
        baseUsername += "user";
    }

    // Append a random 4-digit number to make it unique
    const randomNum = Math.floor(1000 + Math.random() * 9000); // 1000 - 9999
    return `${baseUsername}${randomNum}`;
};

export {generateUsername}
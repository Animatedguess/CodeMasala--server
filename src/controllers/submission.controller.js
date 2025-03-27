import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const JUDGE0_API_HEADERS = {
    "x-rapidapi-key": "89b23a3be8msh4211b0924b8789ap1257d8jsn3847ca34ad71",
    "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
    "Content-Type": "application/json"
};

const submitCode = async (code) => {
    // Encode source code in Base64
    const encodedCode = Buffer.from(code).toString("base64");

    const response = await fetch(`${process.env.JUDGE0_API_URL}?base64_encoded=true&wait=false&fields=*`, {
        method: "POST",
        headers: JUDGE0_API_HEADERS,
        body: JSON.stringify({ language_id: 93, source_code: encodedCode })
    });

    if (!response.ok) {
        throw new Error("Failed to submit code");
    }

    return response.json();
};

const fetchResult = async (token) => {
    const url = `${process.env.JUDGE0_API_URL}/${token}?base64_encoded=true&fields=*`;
    while (true) {
        const response = await fetch(url, { method: "GET", headers: JUDGE0_API_HEADERS });
        if (!response.ok) {
            throw new Error("Failed to fetch execution result");
        }

        const result = await response.json();
        if (result.status.id === 3) { // 3 means the code executed successfully
            return result;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Polling delay
    }
};

const codeRunner = async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) {
            throw new ApiError(400, "Code is required");
        }

        // Submit code to Judge0 API
        const submission = await submitCode(code);

        // Fetch execution result
        const result = await fetchResult(submission.token);

        // Decode and return output
        const output = result.stdout ? atob(result.stdout) : "No output";
        res.status(200).json(new ApiResponse(200, "Code executed successfully", output));
    } catch (error) {
        res.status(error.statusCode || 500).json(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
    }
};

export {
    codeRunner
};
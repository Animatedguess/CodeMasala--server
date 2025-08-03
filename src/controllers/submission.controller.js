import { Problem } from "../models/problem.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const JUDGE0_API_HEADERS = {
    "x-rapidapi-key": process.env.JUDGE0_RAPIDAPI_KEY,
    "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
    "Content-Type": "application/json"
};

// Encode code to base64
const encodeBase64 = (str) => Buffer.from(str).toString("base64");
// Decode from base64
const decodeBase64 = (str) => Buffer.from(str, "base64").toString("utf-8");

const submitCode = async (code, language_id) => {
    const encodedCode = encodeBase64(code);

    const response = await fetch(`${process.env.JUDGE0_API_URL}?base64_encoded=true&wait=false&fields=*`, {
        method: "POST",
        headers: JUDGE0_API_HEADERS,
        body: JSON.stringify({ language_id, source_code: encodedCode })
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
        if (result.status.id >= 3) {
            console.log(result);
            return result;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }
};

const codeRunner = async (req, res) => {
    try {
        const { code, language_id, problemId } = req.body;
        if (!code) {
            return res.status(400).json(new ApiError(400, "Code is required"));
        }

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json(new ApiError(404, "Problem not found"));
        }

        const { testCases } = problem;

        // Wrap user code in test harness
        const testWrapper = testCases.map((tc, i) => {
            return `console.log(${problem.functionName}(${tc.input}))`;
        }).join('\n');

        const finalCode = `${code}\n\n${testWrapper}`;

        // Submit code to Judge0
        const submission = await submitCode(finalCode, language_id);

        // Get result
        const result = await fetchResult(submission.token);
        const output = result.stdout ? decodeBase64(result.stdout).trim().split('\n') : [];

        // Match output to expected
        const testResults = testCases.map((tc, i) => ({
            input: tc.input,
            expected: tc.expectedOutput.trim(),
            received: output[i]?.trim() || "",
            passed: tc.expectedOutput.trim() === (output[i]?.trim() || "")
        }));

        const allPassed = testResults.every(tc => tc.passed);

        return res.status(200).json(
            new ApiResponse(200, allPassed ? "All test cases passed!" : "Some test cases failed.", { testResults })
        );
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Internal Server Error")
        );
    }
};

export {
    codeRunner
};
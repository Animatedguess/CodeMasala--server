import { Problem } from "../models/problem.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const JUDGE0_API_HEADERS = {
  "x-rapidapi-key": process.env.JUDGE0_RAPIDAPI_KEY,
  "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
  "Content-Type": "application/json",
};

// Encode/Decode base64 for Judge0
const encodeBase64 = (str) => Buffer.from(str).toString("base64");
const decodeBase64 = (str) => Buffer.from(str, "base64").toString("utf-8");

const submitCode = async (code, language_id) => {
  const encodedCode = encodeBase64(code);
  const response = await fetch(
    `${process.env.JUDGE0_API_URL}?base64_encoded=true&wait=false&fields=*`,
    {
      method: "POST",
      headers: JUDGE0_API_HEADERS,
      body: JSON.stringify({ language_id, source_code: encodedCode }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to submit code");
  }
  return response.json();
};

const fetchResult = async (token, timeoutMs = 15000) => {
  const url = `${process.env.JUDGE0_API_URL}/${token}?base64_encoded=true&fields=*`;
  const startTime = Date.now();

  while (true) {
    if (Date.now() - startTime > timeoutMs) {
      throw new Error("Execution timeout: Judge0 did not respond in time");
    }
    const response = await fetch(url, {
      method: "GET",
      headers: JUDGE0_API_HEADERS,
    });
    if (!response.ok) {
      throw new Error("Failed to fetch execution result");
    }
    const result = await response.json();
    if (result.status.id >= 3) {
      return result;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};

// ✅ Build test wrapper depending on language
const buildTestWrapper = (languageName, functionName, testCases) => {
  return testCases
    .map((tc) => {
      if (languageName === "python") {
        const safeArgs = tc.input.map((arg) => JSON.stringify(arg)).join(", ");
        return `print(${functionName}(${safeArgs}))`;
      } else if (languageName === "javascript") {
        const safeArgs = tc.input.map((arg) => JSON.stringify(arg)).join(", ");
        return `console.log(${functionName}(${safeArgs}))`;
      } else if (languageName === "cpp") {
        const safeArgs = tc.input.map((arg) => arg).join(", "); // assuming raw for C++
        return `std::cout << ${functionName}(${safeArgs}) << std::endl;`;
      }
      throw new Error(`Unsupported language: ${languageName}`);
    })
    .join("\n");
};

const codeRunner = async (req, res) => {
  try {
    const { code, language_id, problemId, languageName } = req.body;
    if (!code || !language_id || !languageName) {
      return res
        .status(400)
        .json(
          new ApiError(400, "Code, language_id, and languageName are required")
        );
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json(new ApiError(404, "Problem not found"));
    }

    if (
      !problem.supportedLanguages.some(
        (lang) => lang.language_id === language_id
      )
    ) {
      return res
        .status(400)
        .json(new ApiError(400, "Language not supported for this problem"));
    }

    const functionName = problem.functionName;
    if (!functionName) {
      return res
        .status(400)
        .json(new ApiError(400, `Function name not found for ${languageName}`));
    }

    const testWrapper = buildTestWrapper(
      languageName,
      functionName,
      problem.testCases
    );
    const finalCode = `${code}\n\n${testWrapper}`;

    const submission = await submitCode(finalCode, language_id);
    const result = await fetchResult(submission.token);

    // Handle Judge0 errors
    if (result.status.id === 6) {
      // Compilation Error
      return res.status(400).json(
        new ApiError(400, "Compilation Error", {
          compile_output: decodeBase64(result.compile_output || ""),
        })
      );
    }
    if (result.status.id >= 7) {
      // Runtime Errors
      return res.status(400).json(
        new ApiError(400, "Runtime Error", {
          stderr: decodeBase64(result.stderr || ""),
          status: result.status.description,
        })
      );
    }

    const output = result.stdout
      ? decodeBase64(result.stdout).trim().split("\n")
      : [];
    const testResults = problem.testCases.map((tc, i) => ({
      input: tc.input,
      expected: tc.expectedOutput.trim(),
      received: output[i]?.trim() || "",
      passed: tc.expectedOutput.trim() === (output[i]?.trim() || ""),
    }));

    const allPassed = testResults.every((tc) => tc.passed);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          allPassed ? "All test cases passed!" : "Some test cases failed.",
          { testResults }
        )
      );
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(
        new ApiError(
          error.statusCode || 500,
          error.message || "Internal Server Error"
        )
      );
  }
};

export { codeRunner };

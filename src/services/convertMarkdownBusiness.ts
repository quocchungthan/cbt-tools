import path from "node:path";
import { promises as fs } from "node:fs";
import { v4 as uuidv4 } from "uuid";
import {
	addMarkdownOutput,
	updateJob,
	getUploadFilePath,
} from "../services/dataservice/convertMarkdownData";

export const pdf2markdownToolBaseUrl =
	process.env.PDF2MARKDOWN_BASE_URL || "http://localhost:3002";

export async function processConvertMarkdownJob(job: {
	jobId: string;
	uploadId: string;
	command?: string;
}) {
	try {
		// Use dataservice to get the uploaded PDF file path
		const pdfPath = await getUploadFilePath(job.uploadId);
		const pdfFile = path.basename(pdfPath);

		// Prepare form-data for POST
		const FormData = (await import("form-data")).default;
		const form = new FormData();
		form.append("file", await fs.readFile(pdfPath), {
			filename: pdfFile,
			contentType: "application/pdf",
		});

		// Send to PDF2Markdown API
		const fetch = (await import("node-fetch")).default;
		const response = await fetch(`${pdf2markdownToolBaseUrl}/api/convert`, {
			method: "POST",
			body: form,
			headers: form.getHeaders(),
		});

		if (!response.ok)
			throw new Error(`PDF2Markdown API error: ${response.status}`);

		// Save the returned zip file
		const dir = path.join("database", "markdown", job.jobId);
		await fs.mkdir(dir, { recursive: true });
		const zipPath = path.join(dir, "result.zip");
		const buffer = await response.buffer();
		await fs.writeFile(zipPath, buffer);

		// Unzip and find the original .md file, rename it to match markdown output path
		const unzip = await import("unzipper");
		const zip = await unzip.Open.file(zipPath);
		// Find the .md file (not in images/)
		const mdEntry = zip.files.find(
			(f) => f.path.endsWith(".md") && !f.path.startsWith("images/")
		);
		if (!mdEntry) throw new Error("No markdown file found in zip");
		const markdownId = uuidv4();
		const mdPath = path.join(dir, `${markdownId}.md`);
		// Extract and rename the .md file
		const mdBuffer = await mdEntry.buffer();
		await fs.writeFile(mdPath, mdBuffer);

		// Optionally extract images and metadata as needed (not implemented here)

		await addMarkdownOutput({
			jobId: job.jobId,
			markdownId,
			path: mdPath,
			createdAt: new Date().toISOString(),
		});

		// Update job status to 'succeeded'
		await updateJob(job.jobId, { status: "succeeded", progress: 100 });
	} catch (err) {
		// Update job status to 'failed'
		await updateJob(job.jobId, {
			status: "failed",
			error: err instanceof Error ? err.message : String(err),
		});
	}
}

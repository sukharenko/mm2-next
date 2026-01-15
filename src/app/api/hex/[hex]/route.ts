import { NextResponse } from "next/server";
import https from "https";

export async function GET(
  request: Request,
  props: { params: Promise<{ hex: string }> }
) {
  const params = await props.params;
  const hex = params.hex;

  if (!hex) {
    return NextResponse.json({ error: "Hex code required" }, { status: 400 });
  }

  return new Promise<NextResponse>((resolve) => {
    // https://api.adsbdb.com/v0/aircraft/10264
    const options = {
      hostname: "api.adsbdb.com",
      path: `/v0/aircraft/${hex}`,
      method: "GET",
      // rejectUnauthorized: false, // Valid SSL now, so we can verify if we want, or leave it lenient
      headers: {
        "User-Agent": "MM2/1.0",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          // Attempt to parse JSON regardless of status
          let jsonData;
          try {
            jsonData = JSON.parse(data);
          } catch (e) {
            // Not JSON
          }

          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(NextResponse.json(jsonData || data));
          } else if (res.statusCode === 404) {
            // Handle 404 gracefully - it just means no data for this aircraft
            resolve(
              NextResponse.json(
                { error: "Aircraft not found" },
                { status: 404 }
              )
            );
          } else {
            console.error(
              `Upstream error ${res.statusCode}:`,
              data.substring(0, 200)
            );
            resolve(
              NextResponse.json(
                {
                  error: `Upstream error: ${res.statusCode}`,
                  details: jsonData || data,
                },
                { status: 502 }
              )
            );
          }
        } catch (error) {
          console.error("Processing error:", error);
          resolve(
            NextResponse.json(
              { error: "Failed to process upstream data" },
              { status: 500 }
            )
          );
        }
      });
    });

    req.on("error", (error) => {
      console.error("Request error:", error);
      resolve(
        NextResponse.json(
          { error: "Upstream connection failed", details: String(error) },
          { status: 500 }
        )
      );
    });

    req.end();
  });
}

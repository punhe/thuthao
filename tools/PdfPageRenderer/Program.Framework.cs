using System;
using System.IO;
using System.Threading.Tasks;
using System.Runtime.InteropServices.WindowsRuntime;
using Windows.Data.Pdf;
using Windows.Storage;
using Windows.Storage.Streams;

public static class Program
{
    public static int Main(string[] args)
    {
        try
        {
            return MainAsync(args).GetAwaiter().GetResult();
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine(ex.ToString());
            return 1;
        }
    }

    private static async Task<int> MainAsync(string[] args)
    {
        if (args.Length < 2)
        {
            Console.Error.WriteLine("Usage: PdfPageRenderer <pdfPath> <outputDir> [width]");
            return 1;
        }

        var pdfPath = Path.GetFullPath(args[0]);
        var outputDir = Path.GetFullPath(args[1]);
        var width = 1600;

        if (args.Length >= 3)
        {
            int.TryParse(args[2], out width);
            if (width <= 0)
            {
                width = 1600;
            }
        }

        Directory.CreateDirectory(outputDir);

        StorageFile file = await StorageFile.GetFileFromPathAsync(pdfPath);
        PdfDocument document = await PdfDocument.LoadFromFileAsync(file);

        for (uint pageIndex = 0; pageIndex < document.PageCount; pageIndex++)
        {
            using (var page = document.GetPage(pageIndex))
            using (var stream = new InMemoryRandomAccessStream())
            {
                var options = new PdfPageRenderOptions();
                options.DestinationWidth = (uint)width;

                await page.RenderToStreamAsync(stream, options);
                stream.Seek(0);

                var outputPath = Path.Combine(outputDir, string.Format("page-{0:D2}.png", pageIndex + 1));

                using (var output = File.Create(outputPath))
                using (var input = stream.AsStreamForRead())
                {
                    await input.CopyToAsync(output);
                }

                Console.WriteLine(outputPath);
            }
        }

        return 0;
    }
}

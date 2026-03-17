using System.Runtime.InteropServices.WindowsRuntime;
using Windows.Data.Pdf;
using Windows.Storage;
using Windows.Storage.Streams;

if (args.Length < 2)
{
    Console.Error.WriteLine("Usage: PdfPageRenderer <pdfPath> <outputDir> [width]");
    return 1;
}

var pdfPath = Path.GetFullPath(args[0]);
var outputDir = Path.GetFullPath(args[1]);
var width = args.Length >= 3 && int.TryParse(args[2], out var parsedWidth) ? parsedWidth : 1600;

Directory.CreateDirectory(outputDir);

var file = await StorageFile.GetFileFromPathAsync(pdfPath);
var document = await PdfDocument.LoadFromFileAsync(file);

for (uint pageIndex = 0; pageIndex < document.PageCount; pageIndex++)
{
    using var page = document.GetPage(pageIndex);
    using var stream = new InMemoryRandomAccessStream();

    var options = new PdfPageRenderOptions
    {
        DestinationWidth = (uint)width
    };

    await page.RenderToStreamAsync(stream, options);
    stream.Seek(0);

    var outputPath = Path.Combine(outputDir, $"page-{pageIndex + 1:D2}.png");
    await using var output = File.Create(outputPath);
    await using var input = stream.AsStreamForRead();
    await input.CopyToAsync(output);

    Console.WriteLine(outputPath);
}

return 0;

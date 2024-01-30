import { requestData } from "@nfjs/front-pl";

NF.printReport = async (reportName, variables, options) => new Promise(async (resolve, reject) => {
    try {
        const downloadResp = await requestData('/@reports/downloadReport', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reportName: reportName,
                variables: variables,
                options: options
            }),
        });
        const downloadData = await downloadResp.blob();
        var url = window.URL.createObjectURL(downloadData);
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.href = url;
        a.download = options.customFileName ? `${options.customFileName}.${options.extension}` : `${reportName}.${options.extension}`;
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        resolve();
    }
    catch (err) {
        reject(err);
    }
});
NF.openReport = async (reportCode, variables, extension, options) => new Promise(async (resolve, reject) => {
    try {
        const resp = await fetch('/@reports/checkReportData', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reportName: reportName,
                extension: extension,
                variables: variables,
                options: options
            }),
        });
        const responseData = await resp.json();
        if (responseData.error) {
            reject(responseData);
        }
        else {
            resolve({ reportName: reportName, data: responseData, options: options});
        }
    }
    catch (err) {
        reject(err);
    }
});

NF.printReport = async (reportName, variables, options) => new Promise(async (resolve, reject) => {
    try {
        const resp = await fetch('/@reports/checkReportData', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reportName: reportName,
                variables: variables,
                options: options
            }),
        });

        const responseData = await resp.json();
        if (responseData.error) {
            reject(responseData);
        }
        else {
            const downloadResp = await fetch('/@reports/downloadReport', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reportName: reportName,
                    variables: responseData.variables,
                    options: options,
                    provider: responseData.provider
                }),
            });
            const downloadData = await downloadResp.blob();
            var url = window.URL.createObjectURL(downloadData);
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.href = url;
            a.download = reportName + `.${options.extension}`;
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            resolve();
        }
    }
    catch (err) {
        reject(err);
    }
});
NF.openReport = async (reportName, variables, extension, options) => new Promise(async (resolve, reject) => {
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

NF.printReport = async (reportName, variables, extension, options) => new Promise(async (resolve, reject) => {
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
            const downloadResp = await fetch('/@reports/downloadReport', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reportName: reportName,
                    extension: extension,
                    variables: responseData.variables,
                    options: options,
                    provider: responseData.provider
                }),
            });
            const downloadData = await downloadResp.json();
            const blob = new Blob([new Uint8Array(downloadData)], { type: 'application/pdf' });
            var fileURL = URL.createObjectURL(blob);
            window.open(fileURL);

            resolve();
        }
    }
    catch (err) {
        reject(err);
    }
});

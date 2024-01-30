import { dbapi } from "@nfjs/back";
import dayjs from 'dayjs';

import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

function parceType(type) {
    switch (type) {
        case 'numb': {
            return 'int';
        }
        case 'bool': {
            return 'boolean';
        }
        case 'date': {
            return 'date'
        }
        default: {
            return 'string';
        }
    }
}

export default async function process(command, onResult, context, options) {
    try {
        if (command.queryString === 'SELECT TABLE_NAME, TABLE_TYPE FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = \'public\'') {
            command.queryString = 'SELECT table_schema||\'.\'||table_name as table_name, table_type FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA NOT IN (\'public\', \'information_schema\', \'pg_catalog\' ) and TABLE_TYPE = \'VIEW\'';
        }
        const resp = await dbapi.query(command.queryString, {}, { context: context, provider: options.provider || 'default', rowMode: 'array' });
        const tz = options.timezone || context.req.headers['x-user-timezone'] || Intl.DateTimeFormat().resolvedOptions().timeZone;
        resp.data.forEach((row) => {
            row.forEach((col, idx) => {
                if (resp.metaData[idx].dataType == 'date' && resp.metaData[idx].dataSubType == 'timestamptz') {
                    row[idx] = dayjs(col).tz(tz).format('YYYY-MM-DDTHH:mm:ss');
                }
            });
        });

        const data = {
            success: true,
            columns: resp.metaData.map(x => x.name),
            rows: resp.data,
            types: resp.metaData.map(x => parceType(x.dataType))
        };
        onResult(data);
    } catch (e) {
        onResult({ success: false, notice: e.message });
    }
}
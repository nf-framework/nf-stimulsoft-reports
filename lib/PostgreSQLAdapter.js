import { dbapi } from "@nfjs/back";

function parceType(type) {
    switch (type) {
        case 'numb': {
            return 'int';
        }
        case 'text': {
            return 'string';
        }
        case 'date': {
            return 'datetime';
        }
        default: {
            return 'text';
        }
    }
}
export default async function process(command, onResult, context, provider) {
    try {
        if (command.queryString === 'SELECT TABLE_NAME, TABLE_TYPE FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = \'public\'') {
            command.queryString = 'SELECT table_schema||\'.\'||table_name as table_name, table_type FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA NOT IN (\'public\', \'information_schema\', \'pg_catalog\' ) and TABLE_TYPE = \'VIEW\'';
        }
        const resp = await dbapi.query(command.queryString, {}, { context: context, provider: provider || 'default', rowMode: 'array' });
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
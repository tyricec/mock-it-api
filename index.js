const casual = require("casual");
const extendCasual = require('./casual_extensions');

extendCasual(casual);

const commonFields = {
    page: 1,
    count() {
        return this.objects.length;
    },
    paginate_by: Math.floor(Math.random * 100),
};

const thresholdParameters = {
    threshold_on_metric: {
        metric: 'raw_metrics.temperature',
        condition: 'greater',
        threshold_a: 20,
    },
    threshold_with_window: {
        metric: 'raw_metrics.temperature',
        condition: 'greater',
        threshold_a: 20,
        interval_sec: 6000,
    },
    threshold_with_occurrence: {
        metric: 'raw_metrics.temperature',
        condition: 'greater',
        threshold_a: 20,
        interval_sec: 6000,
        triggered_amount: 5,
    },
    delta_with_rolling_window: {
        metric: 'raw_metrics.temperature',
        condition: 'greater',
        threshold_a: 20,
        interval_sec: 6000,
    },
    threshold_with_moving_average: {
        metric: 'raw_metrics.temperature',
        condition: 'greater',
        threshold_a: 20,
        interval_sec: 6000,
    },
    delta_with_ref_point: {
        metric: 'raw_metrics.temperature',
        condition: 'greater',
        threshold_a: 20,
        time_point: 10000,
    },
    device_availability: {},
    sensors_health: {},
};

const getData = () => {
    const data = {};

    data.devices = {
        ...commonFields,
        objects: Array(20).fill()
        .map(() => ({
            id: casual.uuid,
            title: casual.device,
            description: casual.sentence,
            erp_asset_number: casual.integer(1, 3000),
            device_id() {
                return this.title;
            },
            device_state: casual.random_element(['unknown', 'connected', 'disconnected', 'turned_off']),
            sensors_state: casual.random_element(['healthy', 'unhealthy']),
        }))
    };
    data.rules = {
        ...commonFields,
        objects: Array(5).fill()
            .map(() => ({
                id: casual.uuid,
                title: casual.title,
                description: casual.sentence,
                enabled: casual.random_element([true, false]),
                is_global: casual.random_element([true, false]),
                cooldown_sec: casual.integer(30, 600),
                type: casual.random_element([
                    'threshold_on_metric',
                    'threshold_with_window',
                    'threshold_with_occurrence',
                    'delta_with_rolling_window',
                    'threshold_with_moving_average',
                    'delta_with_ref_point',
                    'device_availability',
                    'sensors_health',
                ]),
            }))
            .map((rule) => {
                const newRule = { ...rule };

                if (rule.is_global) {
                    newRule.device_profiles = [];
                } else {
                    const device = casual.random_element(data.devices.objects);
                    newRule.device_profiles = [device.id];
                }

                newRule.parameters = thresholdParameters[rule.type];

                return newRule;
            }),
    };
    data.executions = Array(3000).fill()
        .map(() => {
            const rule = casual.random_element(data.rules.objects);
            const device = casual.random_element(data.devices.objects);
            const JAN_1_2001_MS = 1609459200000;
            const APR_14_2022_MS = 1649894400000;

            return {
                id: casual.uuid,
                rule_id: rule.id,
                rule_type: rule.type,
                result: casual.random_element([
                    'triggered',
                    'not_triggered',
                    'cooldown',
                    'failed',
                ]),
                trace_id: casual.uuid,
                payload_id: casual.uuid,
                payload_type: casual.name,
                device_id: device.device_id,
                device_profile_id: device.id,
                execution_context: {
                    test: casual.description,
                    name: casual.title,
                    value: casual.integer(),
                },
                created_at: (new Date(casual.integer(JAN_1_2001_MS, APR_14_2022_MS))).toISOString(),
            };
        });

    return data;
};

const json = JSON.stringify(getData(), null, 2);

module.exports = getData;

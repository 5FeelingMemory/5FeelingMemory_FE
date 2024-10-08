import { useState } from 'react';

import { DatePickerInput } from '@mantine/dates';

const Demo = () => {
    const [value, setValue] = useState<Date | null>(null);
    return <DatePickerInput label='Pick date' placeholder='Pick date' value={value} onChange={setValue} />;
};

export default Demo;

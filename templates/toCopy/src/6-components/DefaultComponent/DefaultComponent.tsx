import React, { FC, useEffect } from 'react';
import { useDefaultHooks } from '../../10-addons/hooks/useDefaultHooks';

const DefaultComponent: FC<any> = () => {
    useDefaultHooks();

    useEffect(() => {
        console.log('DefaultComponent')
    }, [])
    return <div><Button label="Swissgliders's Button" />;</div>
}
/* eslint-disable @typescript-eslint/no-namespace */
import { useDefaultHooks as useDefaultHooks_ } from './10-addons/hooks/useDefaultHooks';
import {
    useIOBTheHomeAdapter as useIOBTheHomeAdapter_,
    useIOBLegacyAdapter as useIOBLegacyAdapter_,
    useSendToUrl as useSendToUrl_,
} from './10-addons/states/iobAppStates';
import { IOBMetaDataGridComponentStructure as IOBMetaDataGridComponentStructure_ } from './6-components/IOBMetaDataGridComponent';

export namespace IOBApp {
    export namespace Components {
        export const IOBMetaDataGridComponentStructure = IOBMetaDataGridComponentStructure_;
    }
    export namespace Hooks {
        export const useDefaultHooks = useDefaultHooks_;
    }
}
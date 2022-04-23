/* eslint-disable @typescript-eslint/no-namespace */
import { useDefaultHooks as useDefaultHooks_ } from './10-addons/hooks/useDefaultHook'
import { default as DefaultComponent_ } from './6-components/DefaultComponent/DefaultComponent';

export namespace DefaultAPP {
    export namespace Components {
        export const DefaultComponent = DefaultComponent_;
    }
    export namespace Hooks {
        export const useDefaultHooks = useDefaultHooks_;
    }
}
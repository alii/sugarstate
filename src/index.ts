import {
	useCallback,
	useRef,
	useSyncExternalStore,
	type Dispatch,
	type MutableRefObject,
	type SetStateAction,
} from "react";

export interface GenericControls<T> {
	subscribe: (notify: () => void) => () => void;
	getState: () => T;
}

export function useLazyRef<T extends {}>(get: () => T) {
	const ref = useRef<T>();

	if (ref.current === undefined) {
		ref.current = get();
	}

	return ref as MutableRefObject<T>;
}

export function useProvideControls<T>(
	initialState: T
): [controls: GenericControls<T>, setState: Dispatch<SetStateAction<T>>] {
	const stateRef = useRef<T>(initialState);
	const subscriptions = useLazyRef(() => new Set<() => void>());

	const controls: GenericControls<T> = {
		getState: () => stateRef.current,

		// need useCallback here otherwise uSES keeps
		// resubscribing as it sees a new identity
		subscribe: useCallback(callback => {
			subscriptions.current.add(callback);

			console.log(subscriptions.current);

			return () => {
				subscriptions.current.delete(callback);
			};
		}, []),
	};

	const setState = useCallback((action: SetStateAction<T>) => {
		const resolved = action instanceof Function ? action(stateRef.current) : action;

		stateRef.current = resolved;

		subscriptions.current.forEach(notify => notify());
	}, []);

	return [controls, setState];
}

export function useControl<T, X = T>(
	control: GenericControls<T>,
	select: (state: T) => X = state => state as never
) {
	const read = () => select(control.getState());
	return useSyncExternalStore(control.subscribe, read, read);
}

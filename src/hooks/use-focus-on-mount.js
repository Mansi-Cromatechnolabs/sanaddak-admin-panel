import { useRef, useEffect } from 'react';

const useFocusOnMount = () => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, []);

  return ref;
};

export default useFocusOnMount;

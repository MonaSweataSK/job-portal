import cors from 'cors';

import config from '../config/env';

export default cors({
	origin: config.CORS_ORIGIN,
});

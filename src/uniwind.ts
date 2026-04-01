// @ts-ignore - uniwind is an optional peer dependency
import { withUniwind } from 'uniwind';
import { EaseView as BaseEaseView } from './EaseView';

export const EaseView = withUniwind(BaseEaseView);

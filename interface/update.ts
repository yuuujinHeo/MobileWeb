export interface newversion {
  version: string;
  date: string;
  message: string;
  type: string;
  parent_id: Number;
  parent_ids: Number[];
}
export const defaultNewVersion = {
  version: '0.0.0',
  date: '0000-00-00 00:00:00',
  message: '',
  type: '',
  parent_id: 0,
  parent_ids: [],
};
export interface version {
  version: string;
  prev_version: string;
  date: string;
}
export const defaultVersion = {
  version: '0.0.0',
  prev_version: '0.0.0',
  date: '0000-00-00 00:00:00',
};

export interface versions {
  'text.txt': {};
  test: {};
}
export const defaultNewVersions = {
  'text.txt': defaultNewVersion,
  test: defaultNewVersion,
};
export const defaultVersions = {
  'text.txt': defaultVersion,
  test: defaultVersion,
};

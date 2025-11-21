export const diagramConfig = {
  columns: [
    {
      color: '#29282e',
      boxes: [
        { id: 'server01', status: 'up', address: '127.0.0.1', deviceType: '', name: 'Config Server', statusInfo: '', layoutVariant: '2col-25-right', chartValues: [0.4, 0.5, 0.6, 0.3, 0.9, 0.7, 0, 0, 0, 0, 0, 0, 0, 0] },
        { id: 'server02', status: 'up', address: '127.0.0.1', deviceType: '', name: 'Config Server', statusInfo: '', layoutVariant: '1x1', chartValues: [0.4, 0.5, 0.6, 0.3, 0.9, 0.7, 0.8, 0.8, 0.8, 0.8, 0.8] },
        { id: 'server03', status: 'up', address: '127.0.0.1', deviceType: '', name: 'Config Server', statusInfo: '', layoutVariant: '4col-2row-special', chartValues: [0.4, 0.5, 0.6, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.9, 0.7, 0.8] }
      ]
    },

    {
      color: '#29282e',
      boxes: [
        { id: 'server11', status: 'down', address: '127.0.0.1', deviceType: '', name: 'Config Server', statusInfo: '', layoutVariant: '2x2-right-25', chartValues: [0.4, 0.5, 0.6, 0.3, 0.9, 0.7, 0.8] },
        { id: 'server12', status: 'down', address: '127.0.0.1', deviceType: '', name: 'Config Server', statusInfo: '', layoutVariant: '2x2-right-33', chartValues: [0.4, 0.5, 0.6, 0.3, 0.9, 0.7, 0.8] },
        { id: 'server13', status: 'down', address: '127.0.0.1', deviceType: '', name: 'Config Server', statusInfo: '', layoutVariant: '1x1', chartValues: [0.4, 0.5, 0.6, 0.3, 0.9, 0.7, 0.8] },
        { id: 'server14', status: 'down', address: '127.0.0.1', deviceType: '', name: 'Config Server', statusInfo: '', layoutVariant: '2x2-right-33' },
        { id: 'server15', status: 'up', address: '127.0.0.1', deviceType: '', name: 'Config Server', statusInfo: '',   layoutVariant: '2x2-right-25', chartValues: [0.4, 0.5, 0.6, 0.3, 0.9, 0.7, 0.8] },
        { id: 'server16', status: 'up', address: '127.0.0.1', deviceType: '', name: 'Config Server', statusInfo: '',   layoutVariant: '4col-2row-special', chartValues: [0.4, 0.5, 0.6, 0.3, 0.9, 0.7, 0.8] }
      ]
    },

    {
      color: '#29282e',
      boxes: [
        { id: 'server21', status: 'up', address: '127.0.0.1', deviceType: '', name: 'Config Server', statusInfo: '',   layoutVariant: '1x1', chartValues: [0.4, 0.5, 0.6, 0.3, 0.9, 0.7, 0.8] },
        { id: 'server22', status: 'up', address: '127.0.0.1', deviceType: '', name: 'Config Server', statusInfo: '',   layoutVariant: '4col-2row-special', chartValues: [0.4, 0.5, 0.6, 0.3, 0.9, 0.7, 0.8] }
      ]
    }
  ],

  connections: [
    { from: 'server01', to: 'server11', color: '#4c5e74' },
    { from: 'server01', to: 'server12', color: '#ff5242' },
    { from: 'server01', to: 'server13', color: '#ff5242' },
    { from: 'server01', to: 'server14', color: '#ff5242' },

    { from: 'server02', to: 'server15', color: '#ff5242' },

    { from: 'server11', to: 'server21', color: '#4c5e74' },
    { from: 'server11', to: 'server22', color: '#4c5e74' },
    { from: 'server12', to: 'server22', color: '#ff5242' },
    { from: 'server13', to: 'server22', color: '#ff5242' }
  ],

  boxMargin: 12,
  baseBoxHeight: 150,
  lineSpacing: 40
};

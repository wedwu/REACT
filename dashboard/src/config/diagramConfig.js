export const diagramConfig = {
  columns: [
    {
      color: '#29282e',
      boxes: [
        { id: 'server01', status: 'up' },
        { id: 'server02', status: 'up' },
        { id: 'server03', status: 'up' }
      ]
    },
    {
      color: '#29282e',
      boxes: [
        { id: 'server11', status: 'down' },
        { id: 'server12', status: 'down' },
        { id: 'server13', status: 'down' },
        { id: 'server14', status: 'down' },
        { id: 'server15', status: 'up' },
        { id: 'server16', status: 'up' }
      ]
    },
    {
      color: '#29282e',
      boxes: [
        { id: 'server21', status: 'up' },
        { id: 'server22', status: 'up' }
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

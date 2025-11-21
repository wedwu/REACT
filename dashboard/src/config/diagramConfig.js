export const diagramConfig = {
  columns: [
    {
      color: '#29282e',
      boxes: [
        { id: 'server01', status: 'up',   layoutVariant: '2col-25-right' },
        { id: 'server02', status: 'up',   layoutVariant: '1x1' },
        { id: 'server03', status: 'up',   layoutVariant: '4col-2row-special' }
      ]
    },

    {
      color: '#29282e',
      boxes: [
        { id: 'server11', status: 'down', layoutVariant: '2x2-right-25' },
        { id: 'server12', status: 'down', layoutVariant: '2x2-right-33' },
        { id: 'server13', status: 'down', layoutVariant: '1x1' },
        { id: 'server14', status: 'down', layoutVariant: '2x2-right-33' },
        { id: 'server15', status: 'up',   layoutVariant: '2x2-right-25' },
        { id: 'server16', status: 'up',   layoutVariant: '4col-2row-special' }
      ]
    },

    {
      color: '#29282e',
      boxes: [
        { id: 'server21', status: 'up',   layoutVariant: '1x1' },
        { id: 'server22', status: 'up',   layoutVariant: '4col-2row-special' }
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

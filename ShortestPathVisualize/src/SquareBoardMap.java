import javax.swing.*;
import java.awt.*;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.util.*;
import java.util.List;

/**
 * SquareBoardMap with animated A* visualization.
 *
 * - Click once to set SOURCE, click twice to set DESTINATION (same toggle behaviour as before).
 * - Click "Animate A*" to run step-by-step animation (open=cyan, closed=blue, path=yellow).
 * - Click "Stop" to cancel animation.
 */
public class SquareBoardMap extends JPanel {
    private final int rows;
    private final int cols;
    private final int tileSize;
    private final int[][] squares;

    // final path (set when A* finishes)
    private List<int[]> path = new ArrayList<>();

    // source and dest (grid indices)
    int[] src = {-1, -1};
    int[] des = {-1, -1};

    // click flow: first click sets source, second click sets dest
    int toggleSelection = 2;

    private int selectedRow = -1;
    private int selectedCol = -1;

    private final Color lightColor = new Color(240, 217, 181);
    private final Color darkColor = new Color(181, 136, 99);
    private final Color gridColor = new Color(50, 50, 50, 120);

    // mapPoints (green) - as requested
    private final List<int[]> mapPoints = Arrays.asList(
            new int[]{1, 26}, new int[]{1, 28}, new int[]{1, 31},
            new int[]{2, 36},
            new int[]{5, 35},
            new int[]{6, 1}, new int[]{6, 8}, new int[]{6, 12}, new int[]{6, 20},
            new int[]{7, 3}, new int[]{7, 7}, new int[]{7, 14},
            new int[]{10, 25}, new int[]{10, 38},
            new int[]{12, 36}
    );

    // animation state arrays (updated via SwingWorker.publish -> process)
    private final boolean[][] animOpen;
    private final boolean[][] animClosed;
    private final boolean[][] animPath;

    // animator worker
    private SwingWorker<Void, int[]> animator;
    // type codes for published events:
    // 0 = closed cell, 1 = open cell added, 2 = path cell (final), 3 = finished (no params)
    private int animationDelayMs = 60; // adjust speed: smaller = faster

    public SquareBoardMap(int rows, int cols, int tileSize, int[][] squares) {
        this.rows = rows;
        this.cols = cols;
        this.tileSize = tileSize;
        this.squares = squares;

        animOpen = new boolean[rows][cols];
        animClosed = new boolean[rows][cols];
        animPath = new boolean[rows][cols];

        // panel size in pixels
        setPreferredSize(new Dimension(cols * tileSize, rows * tileSize));
        setBackground(Color.WHITE);

        MouseAdapter ma = new MouseAdapter() {
            @Override
            public void mouseClicked(MouseEvent e) {
                int col = e.getX() / tileSize;
                int row = e.getY() / tileSize;

                if (col >= 0 && col < cols && row >= 0 && row < rows) {
                    selectedRow = row;
                    selectedCol = col;

                    if (toggleSelection > 0) {
                        if (toggleSelection == 2) {
                            src = new int[]{row, col};
                        } else {
                            des = new int[]{row, col};
                        }
                        toggleSelection--;
                        repaint();
                    }
                }
            }

            @Override
            public void mouseMoved(MouseEvent e) {
                int col = e.getX() / tileSize;
                int row = e.getY() / tileSize;
                Window w = SwingUtilities.getWindowAncestor(SquareBoardMap.this);
                if (w instanceof JFrame f) {
                    if (col >= 0 && col < cols && row >= 0 && row < rows) {
                        f.setTitle(String.format("Map — Hover: row=%d, col=%d", row, col));
                    } else {
                        f.setTitle("Map");
                    }
                }
            }
        };
        addMouseListener(ma);
        addMouseMotionListener(ma);
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        Graphics2D g2 = (Graphics2D) g.create();
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        // base board
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                g2.setColor(squares[r][c] == 0 ? darkColor : lightColor);
                g2.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);
                g2.setColor(gridColor);
                g2.drawRect(c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }

        // draw mapPoints (green)
        g2.setColor(new Color(0, 160, 0, 200));
        for (int[] mp : mapPoints) {
            int mr = mp[0], mc = mp[1];
            if (mr >= 0 && mr < rows && mc >= 0 && mc < cols) {
                g2.fillRect(mc * tileSize, mr * tileSize, tileSize, tileSize);
            }
        }

        // draw open-list (cyan translucent)
        g2.setColor(new Color(0, 200, 200, 120));
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (animOpen[r][c]) {
                    g2.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);
                }
            }
        }

        // draw closed-list (blue translucent)
        g2.setColor(new Color(0, 120, 220, 120));
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (animClosed[r][c]) {
                    g2.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);
                }
            }
        }

        // highlight the last clicked cell (thin overlay)
        if (selectedRow >= 0 && selectedCol >= 0) {
            g2.setColor(new Color(0, 0, 255, 60));
            g2.fillRect(selectedCol * tileSize, selectedRow * tileSize, tileSize, tileSize);
        }

        // source (blue) and destination (red)
        if (src[0] != -1) {
            g2.setColor(new Color(0, 0, 255, 200));
            g2.fillRect(src[1] * tileSize, src[0] * tileSize, tileSize, tileSize);
        }
        if (des[0] != -1) {
            g2.setColor(new Color(255, 0, 0, 200));
            g2.fillRect(des[1] * tileSize, des[0] * tileSize, tileSize, tileSize);
        }

        // animPath (yellow)
        g2.setColor(new Color(255, 200, 0, 200));
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (animPath[r][c]) {
                    // don't override src/des (they are drawn above)
                    if (!(src[0] == r && src[1] == c) && !(des[0] == r && des[1] == c)) {
                        g2.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);
                    }
                }
            }
        }

        // final path (if set) - draw distinct yellow with border
        if (!path.isEmpty()) {
            g2.setColor(new Color(255, 220, 50, 220));
            for (int[] p : path) {
                if (p[0] >= 0 && p[0] < rows && p[1] >= 0 && p[1] < cols) {
                    if (!(src[0] == p[0] && src[1] == p[1]) && !(des[0] == p[0] && des[1] == p[1])) {
                        g2.fillRect(p[1] * tileSize, p[0] * tileSize, tileSize, tileSize);
                        g2.setColor(Color.ORANGE);
                        g2.drawRect(p[1] * tileSize, p[0] * tileSize, tileSize, tileSize);
                        g2.setColor(new Color(255, 220, 50, 220));
                    }
                }
            }
        }

        g2.dispose();
    }

    /**
     * Start animated A* (non-blocking). Each step publishes UI updates via publish/process.
     */
    public void animateAStar() {
        // avoid concurrent runs
        if (animator != null && !animator.isDone()) return;

        // sanity checks (same as previous aStarSearch)
        if (src[0] == -1 || des[0] == -1) {
            JOptionPane.showMessageDialog(this, "Please select source and destination (click twice).");
            return;
        }
        if (isValid(src[0], src[1]) || isValid(des[0], des[1])) {
            JOptionPane.showMessageDialog(this, "Source or destination is out of bounds.");
            return;
        }
        if (!isUnBlocked(squares, src[0], src[1]) || !isUnBlocked(squares, des[0], des[1])) {
            JOptionPane.showMessageDialog(this, "Source or destination is blocked.");
            return;
        }
        if (isDestination(src[0], src[1], des)) {
            JOptionPane.showMessageDialog(this, "Source equals destination.");
            return;
        }

        clearAnimationState(); // reset visuals
        path.clear();

        animator = new SwingWorker<>() {
            @Override
            protected Void doInBackground() throws Exception {
                // standard A* setup
                boolean[][] closedListLocal = new boolean[rows][cols];
                Cell[][] cellDetails = new Cell[rows][cols];
                for (int i = 0; i < rows; i++) {
                    for (int j = 0; j < cols; j++) {
                        cellDetails[i][j] = new Cell();
                        cellDetails[i][j].f = Double.POSITIVE_INFINITY;
                        cellDetails[i][j].g = Double.POSITIVE_INFINITY;
                        cellDetails[i][j].h = Double.POSITIVE_INFINITY;
                        cellDetails[i][j].parent_i = -1;
                        cellDetails[i][j].parent_j = -1;
                    }
                }

                int i = src[0], j = src[1];
                cellDetails[i][j].f = 0.0;
                cellDetails[i][j].g = 0.0;
                cellDetails[i][j].h = 0.0;
                cellDetails[i][j].parent_i = i;
                cellDetails[i][j].parent_j = j;

                PriorityQueue<Node> openList = new PriorityQueue<>();
                openList.add(new Node(0.0, i, j));
                // Mark source as open (publish)
                publish(new int[]{1, i, j});
                Thread.sleep(310 - animationDelayMs);

                final double DIAG_COST = Math.sqrt(2);
                boolean foundDest = false;

                while (!openList.isEmpty() && !isCancelled()) {
                    Node p = openList.poll();
                    i = p.row;
                    j = p.col;

                    // skip if already processed
                    if (closedListLocal[i][j]) continue;

                    // mark closed
                    closedListLocal[i][j] = true;
                    publish(new int[]{0, i, j}); // closed
                    Thread.sleep(310 - animationDelayMs);

                    // examine 8 neighbors
                    int[] rowNbr = {-1, 1, 0, 0, -1, -1, 1, 1};
                    int[] colNbr = {0, 0, 1, -1, 1, -1, 1, -1};

                    for (int nbr = 0; nbr < 8; nbr++) {
                        int newRow = i + rowNbr[nbr];
                        int newCol = j + colNbr[nbr];

                        if (isValid(newRow, newCol)) continue; // out of bounds

                        if (isDestination(newRow, newCol, des)) {
                            cellDetails[newRow][newCol].parent_i = i;
                            cellDetails[newRow][newCol].parent_j = j;

                            // reconstruct path
                            List<int[]> foundPath = new ArrayList<>();
                            int row = des[0], col = des[1];
                            while (!(cellDetails[row][col].parent_i == row && cellDetails[row][col].parent_j == col)) {
                                foundPath.add(new int[]{row, col});
                                int tempRow = cellDetails[row][col].parent_i;
                                int tempCol = cellDetails[row][col].parent_j;
                                row = tempRow; col = tempCol;
                            }
                            foundPath.add(new int[]{row, col});
                            Collections.reverse(foundPath);

                            // publish path cells (animated)
                            for (int[] pcell : foundPath) {
                                if (isCancelled()) break;
                                publish(new int[]{2, pcell[0], pcell[1]});
                                Thread.sleep(310 - animationDelayMs);
                            }

                            // set final path on EDT
                            SwingUtilities.invokeLater(() -> {
                                path = foundPath;
                                repaint();
                            });

                            foundDest = true;
                            break;
                        }

                        if (!closedListLocal[newRow][newCol] && isUnBlocked(squares, newRow, newCol)) {
                            double gNew = cellDetails[i][j].g + ((Math.abs(rowNbr[nbr]) + Math.abs(colNbr[nbr]) == 2) ? DIAG_COST : 1.0);
                            double hNew = calculateHValue(newRow, newCol, des);
                            double fNew = gNew + hNew;

                            if (cellDetails[newRow][newCol].f == Double.POSITIVE_INFINITY || cellDetails[newRow][newCol].f > fNew) {
                                openList.add(new Node(fNew, newRow, newCol));
                                cellDetails[newRow][newCol].f = fNew;
                                cellDetails[newRow][newCol].g = gNew;
                                cellDetails[newRow][newCol].h = hNew;
                                cellDetails[newRow][newCol].parent_i = i;
                                cellDetails[newRow][newCol].parent_j = j;

                                // publish open node (visual)
                                publish(new int[]{1, newRow, newCol});
                                Thread.sleep((310 - animationDelayMs) / 2);
                            }
                        }
                    }
                    if (foundDest) break;
                }

                if (!foundDest && !isCancelled()) {
                    SwingUtilities.invokeLater(() -> JOptionPane.showMessageDialog(SquareBoardMap.this, "Failed to find the destination cell"));
                }
                return null;
            }

            @Override
            protected void process(List<int[]> chunks) {
                // run on EDT; update anim arrays and repaint after each chunk
                for (int[] ev : chunks) {
                    int type = ev[0], r = ev[1], c = ev[2];
                    if (type == 0) { // closed
                        if (r >= 0 && r < rows && c >= 0 && c < cols) {
                            animOpen[r][c] = false;
                            animClosed[r][c] = true;
                        }
                    } else if (type == 1) { // open
                        if (r >= 0 && r < rows && c >= 0 && c < cols) {
                            animOpen[r][c] = true;
                        }
                    } else if (type == 2) { // path cell
                        if (r >= 0 && r < rows && c >= 0 && c < cols) {
                            animPath[r][c] = true;
                        }
                    }
                }
                repaint();
            }

            @Override
            protected void done() {
                // nothing else required; UI already updated by process and SwingUtilities.invokeLater for path
            }
        };

        animator.execute();
    }

    /** Cancel animation and clear visual state */
    public void stopAnimation() {
        if (animator != null && !animator.isDone()) {
            animator.cancel(true);
        }
        clearAnimationState();
        path.clear();
        repaint();
    }

    private void clearAnimationState() {
        for (int r = 0; r < rows; r++) {
            Arrays.fill(animOpen[r], false);
            Arrays.fill(animClosed[r], false);
            Arrays.fill(animPath[r], false);
        }
    }

    // ---------- previously existing helper methods (kept semantics as in your original code) ------------

    private boolean isValid(int row, int col) {
        // NOTE: original code returned true if out-of-bounds; keep same semantics to avoid breaking callers
        return (row < 0 || row >= rows || col < 0 || col >= cols);
    }

    private boolean isUnBlocked(int[][] grid, int row, int col) {
        return grid[row][col] == 1;
    }

    private boolean isDestination(int row, int col, int[] dest) {
        return row == dest[0] && col == dest[1];
    }

    private double calculateHValue(int row, int col, int[] dest) {
        // Euclidean
        return Math.hypot(row - dest[0], col - dest[1]);
    }

    // small helper classes
    private static class Cell {
        double f, g, h;
        int parent_i, parent_j;
    }

    private static class Node implements Comparable<Node> {
        final double f;
        final int row;
        final int col;

        Node(double f, int row, int col) {
            this.f = f;
            this.row = row;
            this.col = col;
        }

        @Override
        public int compareTo(Node o) {
            return Double.compare(this.f, o.f);
        }
    }

    // ---------- demo main (creates GUI with animate / stop / reset) ----------
    private static void createAndShowGui() {
        int[][] grid = {
                // (your grid here) - shortened for clarity; paste the same 13x39 grid from your code
                {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1},
                {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1},
                {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0},
                {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0},
                {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0},
                {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0},
                {1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1},
                {1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1},
                {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1},
                {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1},
                {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,1,1,1,1,1,1},
                {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,1,1,1,1,1,1},
                {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1},
                {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1},
        };

        int rows = grid.length;
        int cols = grid[0].length;
        int tileSize = 30;

        SquareBoardMap boardMap = new SquareBoardMap(rows, cols, tileSize, grid);

        JFrame frame = new JFrame("Map");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.getContentPane().setLayout(new BorderLayout());

        JScrollPane scroll = new JScrollPane(boardMap);
        frame.getContentPane().add(scroll, BorderLayout.CENTER);

        JPanel controls = new JPanel(new FlowLayout(FlowLayout.LEFT));

        JButton animateBtn = new JButton("Animate A*");
        animateBtn.addActionListener(e -> boardMap.animateAStar());
        controls.add(animateBtn);

        JButton stopBtn = new JButton("Stop");
        stopBtn.addActionListener(e -> boardMap.stopAnimation());
        controls.add(stopBtn);

        JButton resetBtn = new JButton("Reset src/des");
        resetBtn.addActionListener(e -> {
            boardMap.src = new int[]{-1, -1};
            boardMap.des = new int[]{-1, -1};
            boardMap.toggleSelection = 2;
            boardMap.path.clear();
            boardMap.clearAnimationState();
            boardMap.repaint();
        });
        controls.add(resetBtn);

        // speed control
        JSlider speed = new JSlider(10, 300, boardMap.animationDelayMs);
        speed.setToolTipText("Animation speed (ms per step)");
        speed.addChangeListener(ev -> boardMap.animationDelayMs = speed.getValue());
        controls.add(new JLabel("Speed:"));
        controls.add(speed);

        frame.getContentPane().add(controls, BorderLayout.SOUTH);

        frame.pack();
        frame.setLocationRelativeTo(null);
        frame.setVisible(true);
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(SquareBoardMap::createAndShowGui);
    }
}

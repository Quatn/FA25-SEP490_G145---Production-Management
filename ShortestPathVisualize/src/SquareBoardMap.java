import javax.swing.*;
import java.awt.*;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.util.*;
import java.util.List;

public class SquareBoardMap extends JPanel {
    private final int rows;
    private final int cols;
    private final int tileSize;
    private final int[][] squares;
    private List<int[]> path = new ArrayList<>();

    // store as grid indices [row, col] or {-1,-1} if unset
    private int[] src = {-1, -1};
    private int[] des = {-1, -1};

    // click flow: click once -> set destination, click twice -> set source (you can change behavior)
    private int toggleSelection = 2;

    private int selectedRow = -1;
    private int selectedCol = -1;

    private final Color lightColor = new Color(240, 217, 181);
    private final Color darkColor = new Color(181, 136, 99);
    private final Color gridColor = new Color(50, 50, 50, 120);

    public SquareBoardMap(int rows, int cols, int tileSize, int[][] squares) {
        this.rows = rows;
        this.cols = cols;
        this.tileSize = tileSize;
        this.squares = squares;

        // panel size in pixels
        setPreferredSize(new Dimension(cols * tileSize, rows * tileSize));
        setBackground(Color.WHITE);

        MouseAdapter ma = new MouseAdapter() {
            @Override
            public void mouseClicked(MouseEvent e) {
                int col = e.getX() / tileSize;
                int row = e.getY() / tileSize;

                if (col >= 0 && col < cols && row >= 0 && row < rows) {
                    // remember the last clicked cell (for highlight feedback)
                    selectedRow = row;
                    selectedCol = col;

                    // set destination first, then source (toggleSelection)
                    if (toggleSelection > 0) {
                        if (toggleSelection == 2) {
                            src = new int[]{row, col};
                        } else {
                            des = new int[]{row, col};
                        }
                        toggleSelection--;
                    }

                    repaint();
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

        // draw board
        drawSquareBoard(g2);

        // highlight the last clicked cell (if any) with a thin overlay
        if (selectedRow >= 0 && selectedCol >= 0) {
            g2.setColor(new Color(0, 0, 255, 60));
            g2.fillRect(selectedCol * tileSize, selectedRow * tileSize, tileSize, tileSize);
        }

        // draw source (blue) and destination (red) using grid indices -> px coords
        if (src[0] != -1) {
            g2.setColor(new Color(0, 0, 255, 160));
            g2.fillRect(src[1] * tileSize, src[0] * tileSize, tileSize, tileSize);
        }

        if (des[0] != -1) {
            g2.setColor(new Color(255, 0, 0, 160));
            g2.fillRect(des[1] * tileSize, des[0] * tileSize, tileSize, tileSize);
        }

        if(!path.isEmpty()){
            path.forEach(point -> {
                if(!Arrays.equals(point, des) && !Arrays.equals(point, src)){
                    g2.setColor(Color.YELLOW);
                    g2.fillRect(point[1] * tileSize, point[0] * tileSize, tileSize, tileSize);
                }
            });
        }

        g2.dispose();
    }

    public void drawSquareBoard(Graphics2D g2) {
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                g2.setColor(squares[r][c] == 0 ? darkColor : lightColor);
                g2.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);

                g2.setColor(gridColor);
                g2.drawRect(c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }

    private static void createAndShowGui() {
        int rows = 10;
        int cols = 10;
        int tileSize = 40;
        int[][] grid = {
                { 1, 0, 1, 1, 1, 1, 0, 1, 1, 1 },
                { 1, 1, 1, 0, 1, 1, 1, 0, 1, 1 },
                { 1, 1, 1, 0, 1, 1, 0, 1, 0, 1 },
                { 0, 0, 1, 0, 1, 0, 0, 0, 0, 1 },
                { 1, 1, 1, 0, 1, 1, 1, 0, 1, 0 },
                { 0, 0, 1, 1, 1, 1, 0, 1, 0, 0 },
                { 1, 0, 0, 0, 0, 1, 0, 0, 0, 1 },
                { 0, 0, 1, 1, 1, 1, 0, 1, 1, 1 },
                { 1, 1, 1, 0, 0, 0, 1, 0, 0, 1 },
                { 1, 0, 1, 1, 1, 1, 0, 1, 1, 1 }};

        SquareBoardMap boardMap = new SquareBoardMap(rows, cols, tileSize, grid);

        JFrame frame = new JFrame("Map");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.getContentPane().setLayout(new BorderLayout());

        JScrollPane scroll = new JScrollPane(boardMap);
        frame.getContentPane().add(scroll, BorderLayout.CENTER);

        JPanel controls = new JPanel(new FlowLayout(FlowLayout.LEFT));

        JButton findBtn = new JButton("Find Path (A*)");
        findBtn.addActionListener(e -> {
            boardMap.aStarSearch();
            boardMap.repaint();
        });
        controls.add(findBtn);

        JButton resetBtn = new JButton("Reset src/des");
        resetBtn.addActionListener(e -> {
            boardMap.src = new int[]{-1, -1};
            boardMap.des = new int[]{-1, -1};
            boardMap.toggleSelection = 2;
            boardMap.path.clear();
            boardMap.repaint();
        });
        controls.add(resetBtn);

        frame.getContentPane().add(controls, BorderLayout.SOUTH);

        frame.pack();
        frame.setLocationRelativeTo(null);
        frame.setVisible(true);
    }

    private boolean isValid(int row, int col) {
        return (row < 0 || row >= rows || col < 0 || col >= cols);
    }

    private boolean isUnBlocked(int[][] grid, int row, int col) {
        return grid[row][col] == 1;
    }

    private boolean isDestination(int row, int col, int[] dest) {
        return row == dest[0] && col == dest[1];
    }

    private double calculateHValue(int row, int col, int[] dest) {
        // Euclidean distance on grid indices
        return Math.hypot(row - dest[0], col - dest[1]);
    }

    private void tracePath(Cell[][] cellDetails, int[] dest) {
        System.out.println("The Path is ");
        int row = dest[0];
        int col = dest[1];

        List<int[]> path = new ArrayList<>();

        // follow parents until parent == self (start)
        while (!(cellDetails[row][col].parent_i == row && cellDetails[row][col].parent_j == col)) {
            path.add(new int[]{row, col});
            int temp_row = cellDetails[row][col].parent_i;
            int temp_col = cellDetails[row][col].parent_j;
            row = temp_row;
            col = temp_col;
        }
        path.add(new int[]{row, col}); // add start
        Collections.reverse(path);
        this.path = path;

        StringBuilder sb = new StringBuilder();
        path.forEach(p -> sb.append("-> (").append(p[0]).append(", ").append(p[1]).append(") "));
        System.out.println(sb.toString());
    }

    private void aStarSearch() {
        // Ensure src/des set
        if (src[0] == -1 || des[0] == -1) {
            System.out.println("Please select source and destination (click twice).");
            return;
        }

        if (isValid(src[0], src[1]) || isValid(des[0], des[1])) {
            System.out.println("Source or destination is invalid");
            return;
        }

        if (!isUnBlocked(squares, src[0], src[1]) || !isUnBlocked(squares, des[0], des[1])) {
            System.out.println("Source or the destination is blocked");
            return;
        }

        if (isDestination(src[0], src[1], des)) {
            System.out.println("We are already at the destination");
            return;
        }

        boolean[][] closedList = new boolean[rows][cols];
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

        // priority queue by f-value
        PriorityQueue<Node> openList = new PriorityQueue<>();
        openList.add(new Node(0.0, i, j));

        boolean foundDest = false;
        final double DIAG_COST = Math.sqrt(2);

        while (!openList.isEmpty()) {
            Node p = openList.poll();
            i = p.row;
            j = p.col;

            // if already processed skip
            if (closedList[i][j]) continue;

            closedList[i][j] = true;

            // For each successor (8 neighbors)
            int[] rowNbr = {-1, 1, 0, 0, -1, -1, 1, 1};
            int[] colNbr = {0, 0, 1, -1, 1, -1, 1, -1};
            for (int nbr = 0; nbr < 8; nbr++) {
                int newRow = i + rowNbr[nbr];
                int newCol = j + colNbr[nbr];

                if (isValid(newRow, newCol)) continue;

                if (isDestination(newRow, newCol, des)) {
                    cellDetails[newRow][newCol].parent_i = i;
                    cellDetails[newRow][newCol].parent_j = j;
                    System.out.println("The destination cell is found");
                    tracePath(cellDetails, des);
                    foundDest = true;
                    return;
                }

                if (!closedList[newRow][newCol] && isUnBlocked(squares, newRow, newCol)) {
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
                    }
                }
            }
        }

        if (!foundDest) {
            System.out.println("Failed to find the destination cell");
        }
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

    public static void main(String[] args) {
        SwingUtilities.invokeLater(SquareBoardMap::createAndShowGui);
    }
}

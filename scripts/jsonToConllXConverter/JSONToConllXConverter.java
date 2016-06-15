import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;

public class JSONToConllXConverter {

	public static void main(String[] args) throws Exception {
		if(args.length != 2) {
			System.err.println("Converts from JSON format to CoNLL-X format\n"
					          + "Input file should have one JSON object per line\n\n"
					          + "USAGE: Two arguments expected: <input_file> <output_file>");
			System.exit(0);
		}
		File inputFile = new File(args[0]);
		File outputFile = new File(args[1]);
		
		ObjectMapper om = new ObjectMapper();
		
		BufferedReader reader = new BufferedReader(new InputStreamReader(new FileInputStream(inputFile), "UTF-8"));
		PrintWriter writer = new PrintWriter(new OutputStreamWriter(new FileOutputStream(outputFile), "UTF-8"));
		String line = null;
		while((line = reader.readLine()) != null) {
			line = line.trim();
			if(!line.equals("")) {
				EasyTreeNode root = om.readValue(line, EasyTreeNode.class);
				List<EasyTreeNode> allNodes = new ArrayList<>();
				Map<EasyTreeNode, EasyTreeNode> nodeToHead = new HashMap<>();
				collectNodes(allNodes, root, nodeToHead);
				
				Collections.sort(allNodes, new Comparator<EasyTreeNode>() {
					public int compare(EasyTreeNode a, EasyTreeNode b) {
						int v1 = a.getId() == null ? -1 : Integer.parseInt(a.getId());
						int v2 = b.getId() == null ? -1 : Integer.parseInt(b.getId());
						return v2-v1;
					}
				});
				
				writeConllX(allNodes, nodeToHead, writer);
			}
		}
		reader.close();
		writer.close();
	}
	
	public static void collectNodes(List<EasyTreeNode> allNodes, 
									EasyTreeNode node, 
									Map<EasyTreeNode, EasyTreeNode> nodeToHead) {
		List<EasyTreeNode> children = node.getChildren();
		List<EasyTreeNode> _children = node.get_children();
		if(children != null) {
			for(EasyTreeNode child : children) {
				allNodes.add(child);
				nodeToHead.put(child, node);
				collectNodes(allNodes, child, nodeToHead);
			}
		}
		if(_children != null) {
			for(EasyTreeNode child : _children) {
				allNodes.add(child);
				nodeToHead.put(child, node);
				collectNodes(allNodes, child, nodeToHead);
			}
		}
	}
	
	public static void writeConllX(List<EasyTreeNode> allNodes, 
								   Map<EasyTreeNode, EasyTreeNode> nodeToHead, 
								   PrintWriter writer) {
		int id = 1;
		for(EasyTreeNode node : allNodes) {
			String text = replaceNull(node.getName());
			String lemma = replaceNull(node.getLemma());
			String cpos = replaceNull(node.getCpos());
			String pos = replaceNull(node.getPos());
			String feats = replaceNull(node.getFeats());
			String head = ((nodeToHead.get(node)==null)?"0":(""+(allNodes.indexOf(nodeToHead.get(node))+1)));
			String deprel = replaceNull(node.getLink());
			String phead = replaceNull(node.getPHead());
			String pdeprel = replaceNull(node.getPDeprel());
			writer.print((""+id++)+ "\t" + text + "\t" + lemma + "\t" + cpos + "\t" + pos + "\t" + feats + "\t" + head + "\t" + deprel + "\t" + phead + "\t" + pdeprel + "\n");
		}
		writer.print("\n");
	}
	
	private static String replaceNull(String s) {
		return s == null ? "_" : s;
	}
	
}
